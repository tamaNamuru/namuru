﻿var express = require('express');
var router = express.Router();

var connection = require('../mysqlConnection');
var select = 'SELECT card_url FROM card WHERE room_id = ?';
var update = 'UPDATE card SET card_url = ? WHERE room_id = ?';

var multer  = require('multer')
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'public/projects/' + req.session.user.id + '/');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);	//originalnameだと拡張子がついているので楽
	}
});
var upload = multer({ storage: storage });

var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	connection.query(select, [req.session.user.id], function(error, result) {
		res.render('cardconfig', { style_url: result[0].card_url });
	});
});

router.get('/config', function(req, res, next) {
	connection.query(select, [req.session.user.id], function(error, result) {
		res.render('cardconfig', { style_url: result[0].card_url });
	});
});

router.post('/update', upload.fields([{name: 'backimageup'}, {name: 'backimagedown'}]), function(req, res, next) {
	console.log(req.body);
	console.log(req.files);
	let id = req.session.user.id;
	
	cssdata = "";
	//BINGOの文字
	if(req.body.bingofont == "なし"){	//なしの場合0pxで上書き
		cssdata += "th{\nfont-size: 0px;\n}";
	}

	cssdata += "td.kazu{\n";
	cssdata += "color: " + req.body.color + ";\n";
	//フォント
	if(req.body.fonttype.length > 0){
		cssdata += "font-family: " + req.body.fonttype + ";\n";
	}
	cssdata += "font-size: " + req.body.fontsize + ";\n";
	//枠線
	if(req.body.waku == 1){	//あり
		wakucolor = req.body.wakucolor;
		cssdata += "-webkit-text-stroke: 2px " + wakucolor + ";\n";
	}
	cssdata += "}\n";

	//画像上
	if(req.files['backimageup'] !== undefined){
		cssdata += "#bingo{\n" +
		"background-image: url('/projects/" + id + "/" + req.files['backimageup'][0].originalname + "');\n}\n";
	}else{
		cssdata += "#bingo{\nbackground-image: " +
		req.body.backimageup_url + ";\n}\n";
	}
	//下
	if(req.files['backimagedown'] !== undefined){
		cssdata += "#number{\n" +
		"background-image: url('/projects/" + id + "/" + req.files['backimagedown'][0].originalname + "');\n}\n";
	}else{
		cssdata += "#number{\nbackground-image: " +
		req.body.backimagedown_url + ";\n}\n";
	}

	let cssurl = '/projects/' + id + '/bingocard.css'
	fs.writeFile('public' + cssurl, cssdata, function(err) {
		if(err) throw err;
		connection.query(update, [cssurl, id], function(error, result) {
			res.redirect('config');
		});
	});
});

module.exports = router;

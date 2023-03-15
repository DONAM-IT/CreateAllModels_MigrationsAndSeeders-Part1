import express from "express";
// var express = require("express");
let configViewEngine = (app) => {
  app.use(express.static("./src/public"));
  // view enginee dùng ejs
  app.set("view enginee", "ejs"); //jsp, blade if else, vòng lăp for
  app.set("views", "./src/views"); //tìm các file ejs trong thư mục
};

module.exports = configViewEngine;

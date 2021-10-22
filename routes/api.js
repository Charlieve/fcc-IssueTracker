'use strict';
require('dotenv').config();

const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectId; 



module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filter = req.query||{};
      if(filter.open){filter.open = filter.open==='true'}
      console.log(req.query)
      console.log(project)
      console.log(req.body)
      client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
          collection.find(filter).toArray((err,data)=>{
            if(err){return console.error(err)}
            if(data){return res.send(data)}
            client.close();
          });
      });
    })
    
    .post(function (req, res){
      let project = req.params.project;
      console.log(project)
      console.log(req.body)
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.send({error:'required field(s) missing'})
      }
      client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
        const newIssue = collection.insertOne({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          open: true,
          status_text: req.body.status_text,
        },(err,data)=>{
            if(err){return console.error(err)}
            if(data){return res.send(data.ops[0])}
            client.close();
          })
      });
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const id = req.body._id;
      if(!id){return res.send({error:'missing _id'})}
      if(!(/^[0-9a-fA-F]{24}$/).test(id)){return res.send({error:'could not update','_id':id})}
      const oid = new ObjectId(id);
      let updatevalid = {};
      if(req.body.issue_title){updatevalid.issue_title = req.body.issue_title};
      if(req.body.issue_text){updatevalid.issue_text = req.body.issue_text};
      if(req.body.created_by){updatevalid.created_by = req.body.created_by};
      if(req.body.assigned_to){updatevalid.assigned_to = req.body.assigned_to};
      if(req.body.status_text){updatevalid.status_text = req.body.status_text};
      if(req.body.open){updatevalid.open = Boolean(req.body.open==='true')};
      if(Object.entries(updatevalid).length === 0){return res.send({error:'no update field(s) sent','_id':id})};
      updatevalid.updated_on = new Date();
      updatevalid = {$set:updatevalid}
      console.log(project)
      console.log(req.body.open)
      client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
        collection.findOneAndUpdate({_id:oid},updatevalid,{returnOriginal:false,upsert:true},(err,data)=>{
            if(err){return res.send({error:'could not update','_id':id})}
            if(data){return res.send({result:'successfully updated','_id':id})}
            client.close();
          })
      })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const id = req.body._id;
      if(!id){return res.send({error:'missing _id'})}
      if(!(/^[0-9a-fA-F]{24}$/).test(id)){return res.send({error: 'could not delete', '_id':id})}
      const oid = new ObjectId(id);
      console.log(project)
      console.log(req.body)
            client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
        collection.deleteOne({_id:oid},(err,data)=>{
            if(err){return res.send({error: 'could not delete', '_id':id})}
            if(data){return res.send({result:'successfully deleted', '_id':id})}
            client.close();
          })
      })
    });
    
};

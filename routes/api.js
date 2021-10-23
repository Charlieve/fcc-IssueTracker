'use strict';
require('dotenv').config();

const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
const ObjectId = require('mongodb').ObjectId; 



module.exports = function (app) {
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filter = req.query||{};
      if(filter.open){filter.open = filter.open==='true'}
      if(filter._id){filter._id = new ObjectId(filter._id)}
      console.log(JSON.stringify(filter))
      client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
          collection.find(filter).toArray((err,data)=>{
            if(err){return console.error(err)}
            if(data){return res.send(data)}
          });
      });
    })
    
    .post(function (req, res){
      let project = req.params.project;
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.send({error:'required field(s) missing'})
      }
      client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
        const newIssue = collection.insertOne({
          issue_title: req.body.issue_title||'',
          issue_text: req.body.issue_text||'',
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by||'',
          assigned_to: req.body.assigned_to||'',
          open: true,
          status_text: req.body.status_text||'',
        },(err,data)=>{
            if(err){return console.error(err)}
            if(data){return res.send(data.ops[0])}
          })
      });
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const id = req.body._id;
      if(id === undefined){return res.send({error:'missing _id'})}
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
        client.connect(err => {
          const collection = client.db("issueTracker").collection(project);
          collection.findOneAndUpdate({_id:oid,open:true},updatevalid,{returnOriginal:false,upsert:true},(err,data)=>{
              if(err){return res.send({error:'could not update','_id':id})}
              if(data){return res.send({result:'successfully updated','_id':data.value._id})}
              //if(data){return res.send(data.value._id)}
            })
        })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const id = req.body._id;
      if(!id){return res.send({error:'missing _id'})}
      if(!(/^[0-9a-fA-F]{24}$/).test(id)){return res.send({error: 'could not delete', '_id':id})}
      const oid = new ObjectId(id);
      const filterObj = req.body;
      filterObj._id = oid;
      if(Object.keys(filterObj).length!== 1){return res.send({error: 'could not delete', '_id':id})}
            client.connect(err => {
        const collection = client.db("issueTracker").collection(project);
        collection.findOne(filterObj,(err,data)=>{
            if(err){return res.send({error: 'could not delete', '_id':id})}
            if(!data){return res.send({error: 'could not delete', '_id':id})}
        })
        collection.deleteOne(filterObj,(err,data)=>{
            if(err){return res.send({error: 'could not delete', '_id':id})}
            if(data){return res.send({result:'successfully deleted', '_id':id})}
          })
      })
    });
    
};

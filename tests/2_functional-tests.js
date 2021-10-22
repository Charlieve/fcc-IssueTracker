const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const ObjectId = require('mongodb').ObjectId; 

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let idGoingToDelete;
  test('Create an issue with every field: POST request to /api/issues/{project}',function(done){
    chai.request(server)
        .post('/api/issues/apitest')
        .send({issue_title: 'issue_title',
                issue_text: 'issue_text',
                created_by: 'created_by',
                assigned_to: 'assigned_to',
                status_text: 'status_text'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.body.issue_title, 'issue_title');
          assert.equal(res.body.issue_text, 'issue_text');
          assert.equal(res.body.created_by, 'created_by');
          assert.equal(res.body.assigned_to, 'assigned_to');
          assert.equal(res.body.status_text, 'status_text');
          idGoingToDelete = res.body._id
          done()
        })
  })
  test('Create an issue with only required fields: POST request to /api/issues/{project}',function(done){
    chai.request(server)
        .post('/api/issues/apitest')
        .send({issue_title: 'issue_title',
                issue_text: 'issue_text',
                created_by: 'created_by',})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.body.issue_title, 'issue_title');
          assert.equal(res.body.issue_text, 'issue_text');
          assert.equal(res.body.created_by, 'created_by');
          done()
        })
  })
  test('Create an issue with missing required fields: POST request to /api/issues/{project}',function(done){
    chai.request(server)
        .post('/api/issues/apitest')
        .send({})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.body.error, 'required field(s) missing');
          done()
        })
  })
  test('View issues on a project: GET request to /api/issues/{project}',function(done){
    chai.request(server)
        .get('/api/issues/apitest')
        .send({})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.typeOf(res.body,'array');
          done()
        })
  })
  test('View issues on a project with one filter: GET request to /api/issues/{project}',function(done){
    chai.request(server)
        .get('/api/issues/apitest')
        .query({open:true})
        .end((err,res)=>{
          assert.equal(res.status,200);
          res.body.forEach(item=>{
          assert.equal(item.open, true);
          })
          done()
        })
  })
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}',function(done){
    chai.request(server)
        .get('/api/issues/apitest')
        .query({open:true,status_text:'status_text'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          res.body.forEach(item=>{
            assert.equal(item.open, true);
            assert.equal(item.status_text, 'status_text');
          })
          done()
        })
  })
  test('Update one field on an issue: PUT request to /api/issues/{project}',function(done){
    chai.request(server)
        .put('/api/issues/apitest')
        .send({_id: ObjectId('61726564c445121b1c4b0338'),status_text:Math.random()})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, '61726564c445121b1c4b0338')
          done()
        })
  })
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}',function(done){
    chai.request(server)
        .put('/api/issues/apitest')
        .send({_id: ObjectId('61726564c445121b1c4b0338'),issue_title:Math.random(),status_text:Math.random()})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, '61726564c445121b1c4b0338')
          done()
        })
  })
  test('Update an issue with missing _id: PUT request to /api/issues/{project}',function(done){
    chai.request(server)
        .put('/api/issues/apitest')
        .send({issue_title:Math.random(),status_text:Math.random()})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.error, 'missing _id');
          done()
        })
  })
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}',function(done){
    chai.request(server)
        .put('/api/issues/apitest')
        .send({})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.error, 'missing _id');
          done()
        })
  })
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}',function(done){
    chai.request(server)
        .put('/api/issues/apitest')
        .send({_id:'123123123'})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, '123123123');
          done()
        })
  })
  test('Delete an issue: DELETE request to /api/issues/{project}',function(done){
    chai.request(server)
        .delete('/api/issues/apitest')
        .send({_id:idGoingToDelete})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, idGoingToDelete);
          done()
        })
  })
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}',function(done){
    chai.request(server)
        .delete('/api/issues/apitest')
        .send({_id:'123123123'})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, '123123123');
          done()
        })
  })
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}',function(done){
    chai.request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end((err,res)=>{
          assert.equal(res.status,200);
            assert.equal(res.body.error, 'missing _id');
          done()
        })
  })
});

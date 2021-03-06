import {keys} from "ramda";
import {expect} from "chai";
import Axios from "axios";
import makeRobot from "shared/makers/robot";
import DB, {makeDB} from "backend/dbs/robot";
import app from "backend/app";
import "backend/server";

// VARS ============================================================================================
let apiRootURL = "http://localhost:" + process.env.HTTP_PORT + "/api";

function resetDB() {
  let newDB = makeDB();
  for (let x of keys(DB)) {
    delete DB[x];
  }
  for (let x of keys(newDB)) {
    DB[x] = newDB[x];
  }
}

// SPECS ===========================================================================================
describe("/api/robots/:id DELETE", function () {
  describe("valid id (model does not exist)", function () {
    let id, model, total, status, body;

    before(function () {
      resetDB();
      model = makeRobot();
      id = model.id;
      total = keys(DB).length;

      return Axios.delete(apiRootURL + "/robots/" + id, model)
        .then(response => [response.status, response.data])
        .catch(response => [response.status, response.data])
        .then(([_status, _body]) => {
          status = _status;
          body = _body;
        });
    });

    it("should not change DB length", function () {
      expect(keys(DB).length).eql(total);
    });

    it("should respond with 404 status", function () {
      expect(status).eql(404);
    });
  });

  describe("valid id (model exists)", function () {
    let id, model, total, status, body;

    before(function () {
      resetDB();
      id = keys(DB).pop();
      model = DB[id];
      total = keys(DB).length;

      return Axios.delete(apiRootURL + "/robots/" + id, model)
        .then(response => [response.status, response.data])
        .catch(response => [response.status, response.data])
        .then(([_status, _body]) => {
          status = _status;
          body = _body;
        });
    });

    it("should change DB length", function () {
      expect(keys(DB).length).eql(total - 1);
    });

    it("should delete model", function () {
      expect(DB[id]).eql(undefined);
    });

    it("should respond with 204 status", function () {
      expect(status).eql(204);
    });

    it("should respond with valid body", function () {
      expect(body).eql("");
    });
  });
});

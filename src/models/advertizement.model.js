"use strict";
const { executeQuery } = require("../helpers/utils");
const moment = require("moment");

var Advertizement = function (params) {
  this.id = params?.id || null;
  this.imageUrl = params?.imageUrl;
  this.link = params?.link;
  this.updatedDate = params.updatedDate || null;
};

Advertizement.addEditAdvertisement = async (data) => {
  try {
    if (data.id) {
      const query = "update advertizement set ? where id = ?";
      const values = [data, data.id];
      const advertizement = await executeQuery(query, values);
      if (advertizement) {
        return advertizement;
      }
    } else {
      const query = "insert into advertizement set ?";
      const values = data;
      const advertizement = await executeQuery(query, values);
      if (advertizement.insertId) {
        return advertizement.insertId;
      }
    }
  } catch (error) {
    return error;
  }
};

Advertizement.getAdvertizementList = async () => {
  try {
    const list = await executeQuery(
      `select * from advertizement order by updatedDate desc`
    );
    return list;
  } catch (error) {
    return error;
  }
};

Advertizement.deleteAdvertizement = async (id) => {
  try {
    const list = await executeQuery(
      `delete from advertizement where id = ${id}`
    );
    return;
  } catch (error) {
    return error;
  }
};

module.exports = Advertizement;

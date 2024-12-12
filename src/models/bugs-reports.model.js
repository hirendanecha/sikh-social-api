"use strict";
const { executeQuery } = require("../helpers/utils");
const moment = require("moment");
const { notificationMail } = require("../helpers/utils");

var BugsAndReports = function (data) {
  this.profileId = data.profileId;
  this.deviceName = data.deviceName;
  this.browserName = data.browserName;
  this.description = data.description;
  this.attachmentFiles = data.attachmentFiles;
  this.isResolved = data.isResolved || "N";
};

BugsAndReports.getBugDetails = async (id) => {
  try {
    const query =
      "select b.*,p.Username,p.ProfilePicName,p.FirstName from bugsAndReports as b left join profile as p on p.ID = b.profileId where b.id = ?";
    const values = [id];
    const bugReport = await executeQuery(query, values);
    return bugReport;
  } catch (error) {
    return error;
  }
};
BugsAndReports.getBugsList = async (limit, offset) => {
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM bugsAndReports`
  );
  const searchData = await executeQuery(
    `select b.*,p.Username,p.ProfilePicName,p.FirstName from bugsAndReports as b left join profile as p on p.ID = b.profileId GROUP BY b.id order by b.createdDate desc limit ? offset ?`,
    [limit, offset]
  );
  return {
    count: searchCount?.[0]?.count || 0,
    bugsList: searchData,
  };
};

BugsAndReports.addBugsReports = async (data) => {
  try {
    const query = "insert into bugsAndReports set ?";
    const values = data;
    const bugs = await executeQuery(query, values);
    if (bugs.insertId) {
      return bugs.insertId;
    }
  } catch (error) {
    return error;
  }
};

BugsAndReports.updateBugsStatus = async (id, profileId, isResolved) => {
  try {
    const query = "update bugsAndReports set isResolved = ? where id = ?";
    const values = [isResolved, id];
    const bugs = await executeQuery(query, values);
    if (bugs) {
      if (profileId) {
        const query =
          "select u.Email,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID = ?";
        const values = [profileId];
        const user = await executeQuery(query, values);
        if (user) {
          const { Email, Username } = user[0];
          notificationMail({
            userName: Username,
            email: Email,
            msg: "Your bug report has been resolved",
          });
        }
      }
      return id;
    }
  } catch (error) {
    return error;
  }
};

BugsAndReports.deleteBugs = async (id) => {
  try {
    const query = "delete from bugsAndReports where id = ?";
    const values = [id];
    const bugs = await executeQuery(query, values);
    if (bugs) {
      return id;
    }
  } catch (error) {
    return error;
  }
};

module.exports = BugsAndReports;

const BugsAndReports = require("../models/bugs-reports.model");
const utils = require("../helpers/utils");
const {
  getPagination,
  getCount,
  getPaginationData,
  executeQuery,
} = require("../helpers/fn");
const environment = require("../environments/environment");
const ejsEmail = require("../helpers/email");

exports.getBugDetails = async (req, res) => {
  const { id } = req.params;
  const data = await BugsAndReports.getBugDetails(id);
  if (data) {
    return res.send(data);
  } else {
    return res.send({ error: true, message: "No data found" });
  }
};
exports.getBugsList = async (req, res) => {
  const { page, size } = req.body;
  const { limit, offset } = getPagination(page, size);
  const data = await BugsAndReports.getBugsList(limit, offset);
  const bugsList = getPaginationData(
    { count: data.count, docs: data.bugsList },
    page,
    limit
  );
  return res.send(bugsList);
};

exports.addBugReports = async (req, res) => {
  try {
    const data = new BugsAndReports(req.body);
    const bugId = await BugsAndReports.addBugsReports(data);
    if (bugId) {
      return res.send({ id: bugId, message: "report added successfully" });
    }
  } catch (error) {
    return res.send({ error: true, message: error });
  }
};
exports.updateBugsStatus = async (req, res) => {
  try {
    const { id, profileId, isResolved } = req.body;
    const bugId = await BugsAndReports.updateBugsStatus(
      id,
      profileId,
      isResolved
    );
    if (bugId) {
      return res.send({
        id: bugId,
        message: "report status updated successfully",
      });
    }
  } catch (error) {
    return res.send({ error: true, message: error });
  }
};
exports.deleteBugs = async (req, res) => {
  try {
    const { id } = req.params;
    const bugId = await BugsAndReports.deleteBugs(id);
    if (bugId) {
      return res.send({
        error: false,
        message: "report deleted successfully",
      });
    }
  } catch (error) {
    return res.send({ error: true, message: error });
  }
};
exports.supportContact = async (req, res) => {
  try {
    const data = req.body;
    const adminMail = environment.ADMIN_EMAIL;
    const name = data?.name;
    const email = data?.email;
    const media = data?.media || null;
    console.log(data);
    let msg = `${data.description}`;
    const mailObj = {
      email: adminMail,
      subject: "New Contact has been registered",
      root: "../email-templates/support-contact.ejs",
      templateData: {
        name: name,
        email: email,
        media: media,
        msg: msg,
      },
      // url: redirectUrl,
    };
    await ejsEmail.sendMail(mailObj);
    return res.send({ error: false, message: "Email sent successfully" });
  } catch (error) {
    return res.send({ error: true, message: error });
  }
};

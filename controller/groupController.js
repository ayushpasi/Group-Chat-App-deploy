const GroupModel = require("../models/groupModel");
const UserGroup = require("../models/userGroup");
const { Op } = require("sequelize");
const UserModel = require("../models/userModel");
const sequelize = require("../util/database");

const createGroup = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start a transaction
  try {
    const groupName = req.body.groupName;
    const admin = req.user.name;
    const members = req.body.members;

    const membersArray = Array.isArray(members) ? members : [members];

    const group = await GroupModel.create(
      { name: groupName, admin: admin },
      { transaction: t }
    );

    const invitedMembers = await UserModel.findAll({
      where: {
        email: {
          [Op.or]: membersArray,
        },
      },
      transaction: t,
    });

    await Promise.all(
      invitedMembers.map(async (user) => {
        const response = await UserGroup.create(
          {
            isadmin: false,
            userId: user.dataValues.id,
            groupId: group.dataValues.id,
          },
          { transaction: t }
        );
      })
    );

    await UserGroup.create(
      {
        isadmin: true,
        userId: req.user.id,
        groupId: group.dataValues.id,
      },
      { transaction: t }
    );

    // Commit the transaction
    await t.commit();

    res
      .status(201)
      .json({ group: group.dataValues.name, members: membersArray });
  } catch (error) {
    console.error(error);
    // Rollback the transaction in case of an error
    await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await GroupModel.findAll({
      attributes: ["name", "admin"],
      include: [
        {
          model: UserGroup,
          where: { userId: req.user.id },
        },
      ],
    });
    res.status(200).json({ groups: groups });
  } catch (error) {
    console.log(error);
  }
};
module.exports = { createGroup, getGroups };

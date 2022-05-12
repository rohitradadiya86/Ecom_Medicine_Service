var DataTypes = require("sequelize").DataTypes;
var _cart_master = require("./cart_master");
var _main_category = require("./main_category");
var _medicine_details = require("./medicine_details");
var _product_master = require("./product_master");
var _sub_category = require("./sub_category");
var _user = require("./user");

function initModels(sequelize) {
  var cart_master = _cart_master(sequelize, DataTypes);
  var main_category = _main_category(sequelize, DataTypes);
  var medicine_details = _medicine_details(sequelize, DataTypes);
  var product_master = _product_master(sequelize, DataTypes);
  var sub_category = _sub_category(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  product_master.belongsTo(main_category, { as: "main_cate", foreignKey: "main_cate_id"});
  main_category.hasMany(product_master, { as: "product_masters", foreignKey: "main_cate_id"});
  sub_category.belongsTo(main_category, { as: "main", foreignKey: "main_id"});
  main_category.hasMany(sub_category, { as: "sub_categories", foreignKey: "main_id"});
  cart_master.belongsTo(medicine_details, { as: "medicine", foreignKey: "medicine_id"});
  medicine_details.hasMany(cart_master, { as: "cart_masters", foreignKey: "medicine_id"});
  medicine_details.belongsTo(product_master, { as: "product", foreignKey: "product_id"});
  product_master.hasMany(medicine_details, { as: "medicine_details", foreignKey: "product_id"});
  product_master.belongsTo(sub_category, { as: "sub_cate", foreignKey: "sub_cate_id"});
  sub_category.hasMany(product_master, { as: "product_masters", foreignKey: "sub_cate_id"});

  return {
    cart_master,
    main_category,
    medicine_details,
    product_master,
    sub_category,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_master', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    main_cate_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'main_category',
        key: 'id'
      }
    },
    sub_cate_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sub_category',
        key: 'id'
      }
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "0 => Inactive\r\n1 => Active"
    },
    ingredient: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    indication: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    manufacturer: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    in_pack: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "how m any tab\/inj in pack"
    },
    pack_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "strip\/vial"
    },
    delivery_time_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "day"
    },
    delivery_time_max: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "day"
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    img_url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'product_master',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "main_cate_id",
        using: "BTREE",
        fields: [
          { name: "main_cate_id" },
        ]
      },
      {
        name: "sub_cate_id",
        using: "BTREE",
        fields: [
          { name: "sub_cate_id" },
        ]
      },
    ]
  });
};

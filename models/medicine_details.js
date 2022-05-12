const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('medicine_details', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'product_master',
        key: 'id'
      }
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weight_type: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    med_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Tab\/Injec"
    },
    piece: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'medicine_details',
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
        name: "product_id",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
    ]
  });
};

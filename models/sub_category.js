const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sub_category', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    main_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'main_category',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'sub_category',
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
        name: "main_id",
        using: "BTREE",
        fields: [
          { name: "main_id" },
        ]
      },
    ]
  });
};

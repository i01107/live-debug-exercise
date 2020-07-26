'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static generateForm(data) {
      let obj = {
        name: data.name, 
        image_url: data.image_url,
        price: +data.price,
        stock: +data.stock,
        category: data.category
      }

      return obj
    }
  };
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: `Name is required.`
        },
        notEmpty: {
          args: true,
          msg: `Name must be filled!`
        }
      }
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: `Image is required.`
        },
        notEmpty: {
          args: true,
          msg: `Image must be provided!`
        },
        isUrl: {
          args: true,
          msg: `Image must be in URL format!`
        }
      }
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: `Price is required.`
        },
        notEmpty: {
          args: true,
          msg: `Price must be provided!`
        },
        isNumeric: {
          args: true,
          msg: `Price must be in number format!`
        },
        min: {
          args: 1,
          msg: `Price must be more than zero!`
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: `Stock is required.`
        },
        notEmpty: {
          args: true,
          msg: `Stock must be provided!`
        },
        isNumeric: {
          args: true,
          msg: `Stock must be in number format!`
        },
        zeroValue(data) {
          if(data < 0) {
            throw new Error(`Stock can't be less than zero!`)
          }
        }
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: `Category is required.`
        },
        notEmpty: {
          args: true,
          msg: `Category must be provided!`
        }
      } 
    }
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
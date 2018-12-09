const express = require('express');
const Product = require('../models/product');
const Review = require('../models/review')

const router = express.Router();

// ===============================================================================
// Review prefabricada
// ===============================================================================

Product.findOne({
  name: "Yoga Mat"
}, (err, mat) => {
  if (err) {
    throw err
  }
  // Create a new review object
  const newReview = new Review({
    author: "Ricardo@gmail.com",
    content: "The description lied, the mat gets slippery very quickly. :("
  });
  // Add the review to the product
  mat.reviews.push(newReview);
  // Save the **parent model**, Product
  mat.save((err) => {
    if (err) {
      throw err
    }
    console.log("Review Added!");
  });
});

// ===============================================================================
// ===============================================================================

router.get('/', (req, res, next) => {
  Product.find({}, (err, products) => {
    if (err) {
      return next('ha habido un error', err)
    }

    res.render('products/index', {
      products: products
    });
  });
});

router.get('/new', (req, res, next) => {
  res.render('products/new');
})

// Esto es sin optimizar la direccion
// router.get('/product-details', (req, res, next) => {
//   const productId = req.query.id;
//
//   Product.findById(productId, (err, product) => {
//     if (err) {
//       return next(err);
//     }
//     res.render('products/show', {
//       product: product
//     });
//   });
// });
//
// optimizandola

router.get('/search', (req, res) => {
  let query = req.query.searchTerm;

  let queryRegex = new RegExp(query);
  // We use a Regex here to find items that are similar to the search
  // For instance if I searched "Yoga", I would then find the Yoga Mat
  Product.find({
    name: queryRegex
  }, (err, products) => {
    if (err) {
      next(err)
    }
    res.render('products/result', {
      products
    });
  });
});

router.get('/cheapest', (req, res, next) => {
  Product
    .find({})
    .sort({ price: "ascending" })
    .exec((err, products) => {
      if (err) { next(err) }
      res.render('products/results',  {products})
    });
});

router.get('/expensive', (req, res, next) => {
  Product
    .find({})
    .sort({ price: "descending" })
    .exec((err, products) => {
      if (err) { next(err) }
      res.render('products/results',  {products})
    });
});

router.get('/:id', (req, res, next) => {
  const productId = req.params.id;

  Product.findById(productId, (err, product) => {
    if (err) {
      return next(err);
    }
    res.render('products/show', {
      product: product
    });
  });
});

router.get('/:id/edit', (req, res, next) => {
  const productId = req.params.id;

  Product.findById(productId, (err, product) => {
    if (err) {
      return next(err);
    }
    res.render('products/edit', {
      product: product
    });
  });
});

// Como hacer direcciones mas amigables
// router.get('/users/:username', (req, res) => {
//   res.send(`Hello, ${req.params.username}`)
// });
router.post('/', (req, res, next) => {
  // Take the params, and translate them into a new object
  const productInfo = {
    name: req.body.name,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
    description: req.body.description
  };

  // Create a new Product with the params
  const newProduct = new Product(productInfo);

  // Save the product to the DB
  newProduct.save((err) => {
    if (err) {
      return render('products/new', {
        errors: newProduct.errors
      })
    }
    // redirect to the list of products if it saves
    return res.redirect('/products');
  });

});

router.post('/:id', (req, res, next) => {
  const productId = req.params.id;
  /*
   * Create a new object with all of the information from the request body.
   * This correlates directly with the schema of Product
   */
  const updates = {
    name: req.body.name,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
    description: req.body.description
  };

  Product.findByIdAndUpdate(productId, updates, (err, product) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/products');
  });
});

router.post('/:id/delete', (req, res, next) => {
  const id = req.params.id;

  Product.findByIdAndRemove(id, (err, product) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/products');
  });

});

module.exports = router;

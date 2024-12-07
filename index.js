const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const qs = require("qs");
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://foodie-bite.sifatulrabbi.com",
    "https://foodie-bite.web.app",
    "https://foodie-app-backend-production.up.railway.app",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ],
  methods: "GET,POST,PUT,PATCH,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 5000;

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtzgzoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//  THIS IS NOT SECURE BUT I AM USING THIS FOR LOCALHOST
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtzgzoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri =
  "mongodb+srv://canteenAdmin:Cant33EnBoy@cluster0.z0y4p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const conn = await client.connect();

    // DB Collections
    const foodsCollection = conn.db("uapDB").collection("menu");

    const orderCollection = conn.db("uapDB").collection("ordersCollection");
    const userCollection = client.db("uapDB").collection("users");

    const foodRequestCollection = conn
      .db("uapDB")
      .collection("foodRequestCollection");

    const foodReviewCollection = conn
      .db("uapDB")
      .collection("foodReviewCollection");
    const reviewCollection = conn.db("uapDB").collection("foodReview");

    const clientReviewCollection = conn
      .db("uapDB")
      .collection("clientReviewCollection");
    const paymentCollection = conn.db("uapDB").collection("paymentCollection");

    //user
    // USER SIGNUP-LOGIN REGISTER INFORMATION RELATED API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // ALL USERS
    app.get("/users", async (req, res) => {
      try {
        // Retrieve the 'search' query parameter
        const search = req.query.search || "";

        // Define a filter for the search
        const query = search
          ? {
              $or: [
                { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
                { email: { $regex: search, $options: "i" } }, // Case-insensitive search by email
              ],
            }
          : {};

        // Fetch the users matching the query
        const users = await userCollection.find(query).toArray();

        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // ROLE-BASED-USER FETCH
    app.get("/user-role", async (req, res, next) => {
      try {
        const user = await userCollection.find();
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    });

    app.get("/user/:email", async (req, res) => {
      try {
        const result = await userCollection.findOne({
          email: req.params.email,
        });
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    });
    // CHECK IF USER IS SELLER OR NOT
    app.get("/user/role/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const findUser = await userCollection.findOne({ email: email });
        const isSeller = findUser.role === "seller";
        res.json({ isSeller });
      } catch (error) {
        console.log(error.message);
      }
    });

    app.patch("/users/role/:id", async (req, res) => {
      const userId = req.params.id;
      const { role } = req.body;

      const result = await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role: role } }
      );

      if (result.modifiedCount > 0) {
        res.json({ success: true, modifiedCount: result.modifiedCount });
      } else {
        res.status(400).json({ success: false, message: "Role not updated" });
      }
    });

    //payment
    app.post("/create-payment", async (req, res) => {
      try {
        const paymentInfo = req.body;
        const trxId = new ObjectId().toString();
        // Payment initiation data
        const initiateData = {
          store_id: "uapca67436a4f6d10e",
          store_passwd: "uapca67436a4f6d10e@ssl",
          total_amount: paymentInfo.amount,
          currency: "BDT",
          tran_id: trxId,
          success_url: "http://localhost:5000/success-payment",
          fail_url: "http://localhost:5000/fail",
          cancel_url: "http://localhost:5000/cancel",
          cus_name: paymentInfo.name,
          cus_email: paymentInfo.email,
          product_name: paymentInfo.productName,
          product_category: "xyz",
          product_profile: "general",
          cus_add1: "Dhaka",
          cus_add2: "Dhaka",
          cus_city: "Dhaka",
          cus_state: "Dhaka",
          cus_postcode: 1000,
          cus_country: "Bangladesh",
          cus_phone: "01711111111",
          cus_fax: "01711111111",
          shipping_method: "NO",
          multi_card_name: "mastercard,visacard,amexcard",
          value_a: "ref001_A",
          value_b: "ref002_B",
          value_c: "ref003_C",
          value_d: "ref004_D",
        };

        // Send data as URL-encoded form data
        const response = await axios.post(
          "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
          qs.stringify(initiateData), // URL encode the data
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const orderData = {
          name: paymentInfo.name,
          email: paymentInfo.email,
          sellerEmail: paymentInfo.sellerEmail,
          paymentId: trxId,
          deliveryDate: paymentInfo.deliveryDate,
          deliveryTime: paymentInfo.DeliveryTime,
          orderDate: paymentInfo.currentDate,
          orderTime: paymentInfo.currentTime,
          FoodId: paymentInfo.productId,
          FoodName: paymentInfo.productName,
          FoodImage: paymentInfo.productImage,
          Price: paymentInfo.amount,
          orderQuantity: paymentInfo.counter,
          status: "pending",
        };
        const savePaymentData = {
          cus_nam: paymentInfo.name,
          paymentId: trxId,
          amount: paymentInfo.amount,
          status: "pending",
        };
        const save = await paymentCollection.insertOne(savePaymentData);
        const saveOrder = await orderCollection.insertOne(orderData);
        if (save && saveOrder) {
          res.send({ paymentUrl: response.data.GatewayPageURL });
        }
      } catch (error) {
        console.error(
          "Error initiating payment:",
          error.response?.data || error.message
        );
        res
          .status(500)
          .json({ error: error.response?.data || "Internal server error" });
      }
    });

    app.post("/success-payment", async (req, res) => {
      const successData = req.body;
      const query = {
        paymentId: successData.tran_id,
      };
      const update = {
        $set: {
          status: "Success",
        },
      };

      if (successData.status !== "VALID") {
        throw new Error("Unauthorized payment, Invalid payment");
      }

      const updatePaymentData = await paymentCollection.updateOne(
        query,
        update
      );

      const updateOrderData = await orderCollection.updateOne(query, update);

      console.log("successData", successData);
      console.log("successData", updatePaymentData);
      console.log("successData", updateOrderData);
      res.redirect("http://localhost:5173/success");
    });
    app.post("/fail", async (req, res) => {
      const failData = req.body;
      const query = {
        paymentId: failData.tran_id,
      };
      const daletePaymentData = await paymentCollection.deleteOne(query);
      const deleteOrderData = await orderCollection.deleteOne(query);
      console.log("deleteData", daletePaymentData);
      console.log("deleteData", deleteOrderData);
      res.redirect("http://localhost:5173/fail");
    });
    app.post("/cancel", async (req, res) => {
      const cancelData = req.body;
      const query = {
        paymentId: cancelData.tran_id,
      };
      const daletePaymentData = await paymentCollection.deleteOne(query);
      const deleteOrderData = await orderCollection.deleteOne(query);
      console.log("deleteData", daletePaymentData);
      console.log("deleteData", deleteOrderData);
      res.redirect("http://localhost:5173/cancel");
    });

    app.get("/payment", async (req, res) => {
      try {
        payment = await paymentCollection.find().toArray();

        res.json(payment);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

    /// FOOD API
    app.get("/api/foods", async (req, res, next) => {
      try {
        const query = req.query.search;
        let products;

        if (query) {
          products = await foodsCollection
            .find({
              $or: [
                { FoodName: { $regex: query, $options: "i" } },
                { RestaurantName: { $regex: query, $options: "i" } },
              ],
            })
            .toArray();
        } else {
          products = await foodsCollection.find().toArray();
        }

        res.json(products);
      } catch (error) {
        console.error("Error occurred during search:", error.message);
        res.status(500).json({ error: "Internal server error" });
        next(error);
      }
    });

    // FOOD POST REQUEST API
    app.post("/api/food", async (req, res, next) => {
      try {
        const foodDetails = req.body;
        const {
          FoodName,
          recipe,
          image,
          category,
          price,
          quantity,
          SellerName,
          SellerEmail,
        } = foodDetails;
        // TODO: ADD VALIDATION TO BACKEND LOGICS
        const updateFood = await foodsCollection.insertOne(foodDetails);
        res.json(updateFood);
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    });
    app.get("/foods", async (req, res) => {
      try {
        // Retrieve the 'search' query parameter
        const search = req.query.search || "";

        // Define a filter for the search
        const query = search
          ? {
              $or: [
                { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
              ],
            }
          : {};

        // Fetch the users matching the query
        const users = await foodsCollection.find(query).toArray();

        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/orders", async (req, res) => {
      try {
        // Retrieve the 'search' query parameter
        const search = req.query.search || "";

        // Define a filter for the search
        const query = search
          ? {
              $or: [
                { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
                { email: { $regex: search, $options: "i" } }, // Case-insensitive search by email
              ],
            }
          : {};

        // Fetch the users matching the query
        const users = await orderCollection.find(query).toArray();

        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // SELLER'S EMAIL FETCH VIEW DETAILS
    app.get("/api/food/:email", async (req, res, next) => {
      try {
        const email = req.params.email;
        const result = await foodsCollection.find({ email: email }).toArray();
        res.json(result);
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    });
    // DELETE SELLER'S FOOD
    app.delete("/api/food/:id", async (req, res, next) => {
      try {
        const { id } = req.params;
        // if (!ObjectId.isValid(id)) {
        //   return res.status(400).json({ message: "Invalid food ID" });
        // }
        const deleteResult = await foodsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (deleteResult.deletedCount === 0) {
          return res
            .status(404)
            .json({ message: "Food not found or already deleted" });
        }
        res.json({
          message: "Food deleted successfully",
          result: deleteResult,
        });
      } catch (error) {
        console.error("Error deleting food:", error.message);
        next(error);
      }
    });
    // VIEW SINGLE FOOD DETAIL
    app.get("/api/foods/:id", async (req, res, next) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const findResult = await foodsCollection.findOne(query);
        res.send(findResult);
      } catch (error) {
        console.error(error.message);
        next(error);
      }
    });
    app.get("/api/food-reviews", async (req, res, next) => {
      try {
        const result = await foodReviewCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    });
    app.get("/api/category", async (req, res) => {
      const filter = req.query.filter; // This can be a category like 'boys', 'girls', etc.
      const limit = parseInt(req.query.limit) || 12;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      try {
        // Build a dynamic filter object
        const query = {};
        if (filter) {
          query.category = filter; // Assuming 'category' is the field in your collection
        }

        const products = await foodsCollection
          .find(query) // Apply the dynamic filter
          .skip(skip) // Skip the appropriate number of documents
          .limit(limit) // Limit the number of results
          .toArray(); // Convert the result to an array

        res.send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send({ message: "Error fetching products" });
      }
    });
    app.get("/search", async (req, res) => {
      const { q } = req.query;

      if (!q) {
        return res.status(400).send({ message: "Query is required" });
      }

      try {
        const regex = new RegExp(q, "i"); // Case-insensitive search
        const products = await foodsCollection
          .find({ name: { $regex: regex } })
          .toArray();

        res.send(products);
      } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.post("/order", async (req, res, next) => {
      try {
        const order = req.body;

        const result = await orderCollection.insertOne(order);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
        next(error);
      }
    });

    app.get("/orders", async (req, res, next) => {
      try {
        const result = await orderCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error(error.message);
        next(error);
      }
    });

    app.get("/myOrders/:email", async (req, res, next) => {
      try {
        const email = req.params.email;
        const result = await orderCollection.find({ email: email }).toArray();
        res.json(result);
      } catch (error) {
        res
          .status(400)
          .json("Error occurred fetching your orders", error.message);
        next(error);
      }
    });

    app.get("/sellerOrders/:email", async (req, res, next) => {
      try {
        const sellerEmail = req.params.email;
        const result = await orderCollection
          .find({ sellerEmail: sellerEmail })
          .toArray();
        res.json(result);
      } catch (error) {
        res
          .status(400)
          .json("Error occurred fetching your orders", error.message);
        next(error);
      }
    });

    app.patch("/sellerOrder/status/:id", async (req, res) => {
      const orderId = req.params.id;
      const { status } = req.body;

      const result = await orderCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: status } }
      );

      if (result.modifiedCount > 0) {
        res.json({ success: true, modifiedCount: result.modifiedCount });
      } else {
        res.status(400).json({ success: false, message: "Role not updated" });
      }
    });

    app.delete("/order/:id", async (req, res, next) => {
      try {
        const id = req.params.id;
        const order = await orderCollection.findOne({ _id: new ObjectId(id) });
        const { FoodName, orderQuantity } = order;
        if (!order) {
          res.status(404).send("Order not found");
        }
        // first delete order
        const deleteOrder = await orderCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (deleteOrder.deletedCount === 1) {
          // once again update the quantity
          await foodsCollection.updateOne(
            { FoodName: FoodName },
            { $inc: { Quantity: +orderQuantity } }
          );
        }

        res.status(200).send(deleteOrder);
      } catch (error) {
        res.status(500).send("Could not delete item", error.message);
        next(error);
      }
    });

    // ClientReviews
    app.get("/client-reviews", async (req, res, next) => {
      try {
        const result = await clientReviewCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error(error.message);
        next(error);
      }
    });

    // FOOD REQUEST COLLECTION RELATED
    app.get("/myRequest/:email", async (req, res, next) => {
      try {
        const email = req.params.email;
        const result = await foodRequestCollection
          .find({ email: email })
          .toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(404).json("Could not find request", error);
        next(error);
      }
    });

    app.post("/addRequest", async (req, res, next) => {
      try {
        const request = req.body;

        const result = await foodRequestCollection.insertOne(request);
        res.send(result);
      } catch (error) {
        console.error(error.message);
        next(error);
      }
    });

    app.delete("/request/:id", async (req, res, next) => {
      try {
        const id = req.params.id;
        const result = await foodRequestCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
        res.status(403).send("Sorry Error occurred while fetching the request");
        next(error);
      }
    });

    // SIFATUL VERSION
    // app.post("/addFoodReview", async (req, res, next) => {
    //   try {
    //     const reviewPayload = req.body;
    //     const { _id, ...payload } = reviewPayload;
    //     // Find the item from the foods collection based on foodName and _id
    //     const findRequestedItem = await foodsCollection.findOne({
    //       _id: new ObjectId(_id),
    //     });
    //     if (!findRequestedItem) {
    //       console.error("Food not found in foods collection Sorry!");
    //       throw new Error("Food not found in foods collection Sorry!");
    //     }
    //     const postReview = await foodReviewCollection.insertOne({
    //       food_id: _id,
    //       ...payload,
    //     });
    //     if (!postReview.insertedId) {
    //       res.status(500).send("Could not post and update review");
    //       return;
    //     }

    //     res.status(200).json(postReview);
    //   } catch (error) {
    //     console.error(error.message);
    //     res.status(500).json({
    //       message: "Sorry, could not post at the moment",
    //     });
    //     next(error);
    //   }
    // });

    app.post("/review", async (req, res) => {
      try {
        const { orderId, foodId, reviewText, rating, sellerEmail, userEmail } =
          req.body;

        // Construct the review object
        const newReview = {
          orderId,
          foodId,
          reviewText,
          rating,
          sellerEmail,
          userEmail,
          createdAt: new Date(),
        };

        // Insert the review into the database
        const result = await reviewCollection.insertOne(newReview);

        // Check if the review was successfully inserted
        if (!result.insertedId) {
          return res.status(500).json({
            error: "Failed to post the review. Please try again later.",
          });
        }

        // Respond with success message and review details
        res.status(201).json({
          message: "Review posted successfully!",
          reviewId: result.insertedId,
          review: newReview,
        });
      } catch (error) {
        console.error("Error posting review:", error.message);
        res.status(500).json({
          error: "An unexpected error occurred while posting the review.",
        });
      }
    });

    app.get("/foodReview/:foodId", async (req, res, next) => {
      try {
        const query = { food_id: req.params.foodId };
        const findItem = await foodReviewCollection.find(query).toArray();
        res.status(200).json(findItem);
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
        next(error);
      }
    });
    // MY VERSION
    app.delete("/myFoodReview/:id", async (req, res, next) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const findMyReview = await reviewCollection.deleteOne(query);
        res.status(200).json(findMyReview);
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
        next(error);
      }
    });

    app.get("/myFoodReview/:email", async (req, res, next) => {
      try {
        const email = req.params.email;
        const result = await reviewCollection
          .find({ userEmail: email })
          .toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
        next(error);
      }
    });

    app.get("/sellerReview/:email", async (req, res, next) => {
      try {
        const email = req.params.email;
        const result = await reviewCollection
          .find({ sellerEmail: email })
          .toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
        next(error);
      }
    });

    app.get("/allReview", async (req, res, next) => {
      try {
        const result = await reviewCollection.find().toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
        next(error);
      }
    });

    app.get("/reviews/:foodId", async (req, res) => {
      const { foodId } = req.params; // Accessing the foodId from route parameters

      try {
        // Find all reviews where foodId matches
        const reviews = await reviewCollection
          .find({ foodId: foodId })
          .toArray();

        if (reviews.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No reviews found for this food item.",
          });
        }

        res.status(200).json({
          success: true,
          message: "Reviews fetched successfully.",
          data: reviews,
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({
          success: false,
          message: "Server error. Could not fetch reviews.",
        });
      }
    });

    /// CLIENT REVIEW GALLERY RELATED
    app.post("/clientReview", async (req, res, next) => {
      try {
        const payload = req.body;
        const { name, email, reviewDescription, imgUrl, userProfile } = payload;
        // Basic validation
        if (!name || !email || !reviewDescription || !imgUrl) {
          return res.status(400).json("All fields are required.");
        }

        if (typeof name !== "string" || name.trim().length === 0) {
          return res.status(400).json("Name must be a non-empty string.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json("Invalid email format.");
        }

        if (
          typeof reviewDescription !== "string" ||
          reviewDescription.trim().length === 0
        ) {
          return res
            .status(400)
            .json("Review description must be a non-empty string.");
        }

        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(imgUrl)) {
          return res.status(400).json("Invalid image URL format.");
        }
        const result = await clientReviewCollection.insertOne({
          name,
          email,
          reviewDescription,
          imgUrl,
          userProfile,
        });
        res.status(200).json(result);
      } catch (error) {
        console.error(error.message);
        res.status(500).json("Sorry, can't process this request now.");
        next(error);
      }
    });

    app.get("/allClientReviews", async (req, res, next) => {
      try {
        const result = await clientReviewCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error(error.message);
        next(error);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server started and running");
});

app.listen(port);

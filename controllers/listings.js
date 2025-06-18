const maptilerClient = require("@maptiler/client");


const Listing = require("../models/listing.js");


module.exports.index = async (req, res) => {
   const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(req.params.id)
  .populate({ path:"reviews", // ensures reviews is an array of Review docs
    strictPopulate: false,
  populate :{ path:"author", 
    strictPopulate: false }
  }) 
  .populate({ path:"owner", strictPopulate: false })   
  .exec();

   if (!listing) {
       req. flash ("error", "Listing you requested for does not exist!");
       res.redirect("/listings");
   }

  res.render("listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res, next) => {
   maptilerClient.config.apiKey = "AhxYCGa8xuMiifarnDle" ;

// Forward geocoding
  const response = await  maptilerClient.geocoding.forward(req.body.listing.location, {
         limit: 1
       });

    // console.log(response.features[0].geometry);
    // res.send("done");
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.features[0].geometry;

        if (newListing.geometry && Array.isArray(newListing.geometry.coordinates)) {
            const [lng, lat] = newListing.geometry.coordinates;
            console.log(`Lng: ${lng}, Lat: ${lat}`);
            console.log(newListing.geometry.coordinates);
          } else {
            console.warn("listing.geometry is undefined or coordinates not set");
          }



    let savedlisting = await newListing.save();
    console.log(savedlisting);
    req.flash("success","New listing created!"); // flash
    res.redirect("/listings");
  };

  module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
  
     if (!listing) {
         req. flash ("error", "Listing you requested for does not exist!");
         res.redirect("/listings");
     }
  
    res.render("listings/edit.ejs", { listing });
  };

  module.exports.updateListing = async (req, res) => {
     let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
   req.flash("success"," listing Updated!"); // flash
  res.redirect(`/listings/${id}`);
};

 module.exports.destroyListing = async (req, res) => {
   let { id } = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
    req.flash("success","listing Deleted!"); // flash
   res.redirect("/listings");
 };
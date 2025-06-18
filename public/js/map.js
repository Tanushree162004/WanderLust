
maptilersdk.config.apiKey = "AhxYCGa8xuMiifarnDle";

  const map = new maptilersdk.Map({
       container: "map", // container's id or the HTML element to render the map
       style: maptilersdk.MapStyle.STREETS,
       center:coordinates, // starting position [lng, lat] [77.216721, 28.644800]
       zoom: 7, // starting zoom
         });

      const marker = new maptilersdk.Marker({
        color: "#FF0000",
        anchor: "bottom",
        scale: 1.2,
        className: "my-marker"
      })
      .setLngLat(coordinates)
      .setPopup( new maptilersdk.Popup({ offset: 25 }).setHTML(`<b>${title}</b><br><span>Exact Location Provided After Booking</span>`))
      .addTo(map);
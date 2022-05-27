var tableNumber=null;
AFRAME.registerComponent("marker-handler", {
  init: async function () {
     if(tableNumber===null){
       this.askTableNumber()
     }
    var dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      console.log("marker-found");
      var markerId = this.el.id;
    
      this.handleMarkerFound(dishes,markerId);
    });

    this.el.addEventListener("markerLost", () => {
      console.log("marker-lost");
      this.handleMarkerLost();
    });
  },
  handleMarkerFound: function (dishes,markerId) {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";
    var ratingButton = document.getElementById("rating-button");
    var orderButton = document.getElementById("order-button");
    var dish = dishes.filter(dish => dish.id === markerId)[0];
    ratingButton.addEventListener("click", function () {
      swal({
        icon: "warning",
        title: "Thanks for ur rating",
        text: "rating",
      });
    });
    orderButton.addEventListener("click", () =>{
      var tNumber;
      tableNumber <=9 ?(tNumber=`T0${tableNumber}`):`T${tableNumber}`
      console.log(tNumber)
      this.handleOrder(tNumber,dish)
      swal({
        icon: "warning",
        title: "Thanks for ur order",
        text: "order",
      });
    });

    

    var model = document.querySelector(`#model-${dish.id}`);
    model.setAttribute("position", dish.model_geometry.position);
    model.setAttribute("rotation", dish.model_geometry.rotation);
    model.setAttribute("scale", dish.model_geometry.scale);
  },

   askTableNumber:function(){
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title:'welcome to menu card',
      icon:iconUrl,
      content:{
        element:'input',
        attributes:{placeholder:'enter ur table no',type:'number',min:1}
      },
      closeOnClickOutside:false
    })
    .then(val=>{
      tableNumber=val
    })
   },
  handleOrder: function (tNumber, dish) {
     console.log('order')
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          details["current_orders"][dish.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][dish.id]["quantity"];
          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1
          };
        }

        details.total_bill += dish.price;

        firebase
          .firestore()
          .collection("tables")
          .doc(doc.id)
          .update(details);
      });
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  getOrderSummary: async function (tNumber) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => doc.data());
  },
  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
    console.log("marker-lost");
  }
});

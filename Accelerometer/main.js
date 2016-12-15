define(['HubLink', 'RIB', 'PropertiesPanel', 'Easy'], function(Hub, RIB, Ppanel, easy){

  var actions = [];
  var inputs = ["X", "Y", "Z"];
  var _objects = {}; // Used to keep a reference of the interface elements
  var Accelerometer = {
    settings:{
      Custom: {}
    },
    dataFeed: {}
  };

  // TODO: Review if this is a trully unique instance?

  Accelerometer.getActions = function() {
    return actions;
  };

  Accelerometer.getInputs = function() {
    return inputs;
  };

  /**
   * Triggered when added for the first time to the side bar.
   * This script should subscribe to all the events and broadcast
   * to all its copies the data.
   * NOTE: The call is bind to the block's instance, hence 'this'
   * does not refer to this module, for that use 'Accelerometer'
   */
  Accelerometer.onLoad = function(){
    var acc = this;

    // Load our properties template and keep it in memory
    this.loadTemplate('properties.html').then(function(template){
      acc.propTemplate = template;
    });

    // Since our Accelerometer object already has all the necessary properties
    // for a subscription (id, serial, nodeName), we can just send
    // the whole object and the subscription will take care of extracting the
    // right arguments
    Hub.subscribe("block:change", this).then(function(event){
      Hub.on(event, function(data){
        // Send my data to anyone listening
        acc.dispatchDataFeed(data);
        // Send data to logic maker for processing
        acc.processData(data);
      }, acc);
    }).catch(function(err){
      console.error("Subscription error: ", err);
    });
  };

  /**
   * Allows blocks controllers to change the content
   * inside the Logic Maker container
   */
  Accelerometer.lmContentOverride = function(){
    // Use this to inject your custom HTML into the Logic Maker screen.
    return "<div> Accelerometer html </div>";
  };

  /**
   * Parent is asking me to execute my logic.
   * This block only initiate processing with
   * actions from the hardware.
   */
  Accelerometer.onExecute = function() {};

  /**
   * Intercepts the properties panel closing action.
   * Return "false" to abort the action.
   * NOTE: Settings Load/Saving will atomatically
   * stop re-trying if the event propagates.
   */
  Accelerometer.onCancelProperties = function(){
    console.log("Cancelling Properties");
  };

  /**
   * Intercepts the properties panel save action.
   * You must call the save method directly for the
   * new values to be sent to hardware blocks.
   * @param settings is an object with the values
   * of the elements rendered in the interface.
   * NOTE: For the settings object to contain anything
   * you MUST have rendered the panel using standard
   * ways (easy.showBaseSettings and easy.renderCustomSettings)
   */
  Accelerometer.onSaveProperties = function(settings){
    console.log("Saving: ", settings);
    this.settings = settings;
    this.saveSettings().catch(function(err){
      if(!err.errorCode){
        console.log(err);
      }else{
        alert("Error (make me a nice alert please): ", err.message);
      }
    });
  };

  /**
   * Triggered when the user clicks on a block.
   * The interace builder is automatically opened.
   * Here you must load the elements.
   * NOTE: This is called with the scope set to the
   * Block object, to access this modules properties
   * use Accelerometer or this.controller
   */
  Accelerometer.onClick = function(){
    var that = this;

    // Read the block's settings
    this.loadSettings(function(settings){
      console.log("Settings loaded: ", settings);
      // This block uses a custom (extra) event mode,
      // so we need to modify the default settings
      var eventMode = settings.EventMode;
      settings.EventMode = {
        property: 'EventMode',
        items: [
          { name: "Always", value: 0, selected: (eventMode === 0)?true:false },
          { name: "ChangeBy", value: 1, selected: (eventMode === 1)?true:false },
          { name: "EqualTo", value: 2, selected: (eventMode === 2)?true:false },
          { name: "GreaterThan", value: 4, selected: (eventMode === 4)?true:false },
          { name: "LowerThan", value: 8, selected: (eventMode === 8)?true:false },
          { name: "AxisCompare", value: 16, selected: (eventMode === 16)?true:false }
        ]
      };

      // available to hardware blocks
      easy.showBaseSettings(that, settings);
      settings.Custom.SamplingRate = {
        property: 'Custom.SamplingRate',
        items: [
          {name: "1Hz", value: 7, selected: settings.Custom.SamplingRate === 7?true:false},
          {name: "2Hz", value: 6, selected: settings.Custom.SamplingRate === 6?true:false},
          {name: "4Hz", value: 5, selected: settings.Custom.SamplingRate === 5?true:false},
          {name: "8Hz", value: 4, selected: settings.Custom.SamplingRate === 4?true:false},
          {name: "16Hz", value: 3, selected: settings.Custom.SamplingRate === 3?true:false},
          {name: "32Hz", value: 2, selected: settings.Custom.SamplingRate === 2?true:false},
          {name: "64Hz", value: 1, selected: settings.Custom.SamplingRate === 1?true:false},
          {name: "120Hz", value: 0, selected: settings.Custom.SamplingRate === 0?true:false}
        ]
      };

      // Select default selected item
      settings.Custom.SamplingRate.items.some(function(item){
        if(item.selected === true){
          settings.Custom.SamplingRate.default = item.name;
          return true;
        }
      });

      settings.Custom.AxisMonitor = {
        property: 'Custom.AxisMonitor',
        items: [
          {name: "X", value: 1, selected: settings.Custom.AxisMonitor & 1?true:false},
          {name: "Y", value: 2, selected: settings.Custom.AxisMonitor & 2?true:false},
          {name: "Z", value: 4, selected: settings.Custom.AxisMonitor & 4?true:false},
        ]
      };

      // Render the template
      var html = $(that.propTemplate(settings.Custom));
      // Init Semantic-UI components
      html.find(".checkbox").checkbox();
      html.find(".dropdown").dropdown();

      // Display elements
      easy.displayCustomSettings(html);

    }).catch(function(err){
      console.log("Error reading settings: ", err);
    });
  };

  /**
   * Parent is send new data (using outputs).
   */
  Accelerometer.onNewData = function() {};

  // Returns the current value of my inputs
  // Accelerometer.onRead = function(){};

  // Optional event handlers
  Accelerometer.onMouseOver = function(){
    // console.log("Mouse Over on ", myself.canvasIcon.id, evt);
  };

  /**
   * A copy has been dropped on the canvas.
   * I need to keep a copy of the processor to be triggered when
   * new data arrives.
   */
  Accelerometer.onAddedtoCanvas = function(){};

  return Accelerometer;

});

var Router = Backbone.Router.extend({
  routes: {
      ":url" : "loadSite",
  },

  initialize: function(){
    this.historyView = new HistoryView({history: new History()});
  },

  loadSite: function(url){
    if(this.historyView.history.array().indexOf(url)<0)
      this.historyView.history.add(url);
    else
      this.historyView.history.current(url);
    new MainView({model: new SiteModel({'Url':url})});
  }
});

var History = function(){

  var currentSite='';

  sessionStorage.sites = sessionStorage.sites || JSON.stringify(new Array());

  _.extend(this, Backbone.Events);

  this.current = function(site){
    if(site){
      currentSite=site;
      this.trigger('change');
    }
    return currentSite;
  }

  this.add = function(site){
    var tempArray = this.array();
    if(tempArray.indexOf(site)<0){
      tempArray.unshift(site);
      sessionStorage.sites = JSON.stringify(tempArray);
    }
    this.current(site);
  };

  this.array = function(){
    return JSON.parse(sessionStorage.sites);
  };

  this.remove = function(site){
    var tempArray = this.array();
    tempArray.splice(tempArray.indexOf(site),1);
    sessionStorage.sites = JSON.stringify(tempArray);
    this.trigger('change')
  };
}


var SiteModel = Backbone.Model.extend({
  url: function(){
      return 'http://api.similarweb.com/site/'+this.get('Url')+'/rankoverview?userkey=a6fd04d833f2c28ce7c30dc957bf481e'
  }
});

var HistoryView = Backbone.View.extend({
      
  el : "#sidebar",

  template : _.template('<% _.each(sites, function(site) { %> <li><a href="#<%= site %>"><%= site %><span class="close">×</span></a></li> <% }); %>'),

  events : {
    "click #search button" : "addSite",
    "click .close" : "removeSite"
  },

  initialize: function(){
    var self = this;
    this.history = this.options.history || new History();
    this.listenTo(this.history, "change", function(){self.render()})
    this.render();
  },

  render: function(){
    this.$("#historyList").html(this.template({sites: this.history.array()}));
    this.$(".close").click(function(event) {
      event.preventDefault(); 
    });
    this.$('#historyList li a[href="#'+this.history.current()+'"]').parent().addClass('active'); 
    return this;
  },

  addSite: function(){
    var site=$('#search input').val();
    if(site.length){
      this.history.add(site);
      window.location.href='#'+site;
    }
    $('#search input').val('')
  },

  removeSite: function(e){
    var siteURL = e.currentTarget.parentElement.hash.substring(1);
    this.history.remove(siteURL);
  }
});

var MainView = Backbone.View.extend({
        
  el : "#main",
  
  templates : {
    'head': _.template('<h4><%= Title %></h4><a href="http://<%= Url %>"><img src="<%= FavIcon %>"><%= Url %></a></div><div class="row pull-right"><h5>Ranked #<%= GlobalRank %> globally, #<%= CategoryRank %> in <%= Category %></h5>'),
    'iframe': _.template('<h4>IFramed <%= Url %></h4><iframe src="http://<%= Url %>" style="width:100%; height:400px"></iframe>'),
    'similar': _.template('<% _.each(sites, function(site) { %> <li style="width:24.5%"><a href="#<%= site.Url %>"><img src="<%= site.FavIcon %>" height="16px"> <%= site.Url.length>12 ? site.Url.substring(0,12)+"..." : site.Url %></a></li> <% }); %>')
  },

  events : {
    "click #showMore" : "renderMore"
  },

  initialize: function(){
    var self=this;
    this.model.fetch().error(function(e){self.renderEmpty();});
    this.listenTo(this.model, "change", function(){this.render();})
  },

  render: function(){
    this.$('#head').html(this.templates.head(this.model.attributes));
    this.renderSimilarSites();
    this.$('#preview').html(this.templates.iframe(this.model.attributes)).removeClass('hide');
    return this;
  },

  renderSimilarSites : function(){
    var sites = this.model.get('SimilarSites');
    if(sites.length>12){
        this.$('#left').html(sites.length-12).parent().removeClass('hide');
        sites = _.first(sites,12);
    }
    else
      this.$('#showMore').addClass('hide');
    
    this.$('#similarList').html(this.templates.similar({sites: sites})).parent().removeClass('hide');
    return this;
  },

  renderMore: function(){
    var sites = _.rest(this.model.get('SimilarSites'),12);
    this.$('#similarList').append(this.templates.similar({sites: sites}));
    this.$('#showMore').addClass('hide');
    return this;
  },

  renderEmpty: function() {
    this.$('#similar, #preview').addClass('hide');
    this.$('#head').html('<h4>Invalid site</h4>');
  }
});


window.router = new Router();
Backbone.history.start({pushState: false});

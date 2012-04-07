var RWOss = {
  repos: [],
  recentlyUpdatedRepos: [],
  
  reposExclude: ["rw-study-wishlist", "railsware.github.com", "shoedazzle", "backbone_showcase", "gdoc_mapreduce", "gcal4ruby"],
  
  init: function(){
    $.getJSON("https://api.github.com/orgs/railsware/repos?public&callback=?", function (result) {
      var repos = result.data;
      $(function () {
        // Convert pushed_at to Date.
        $.each(repos, function (i, repo) {
          repo.pushed_at = new Date(repo.pushed_at);
          var weekHalfLife  = 1.146 * Math.pow(10, -9);
          var pushDelta    = (new Date) - Date.parse(repo.pushed_at);
          var createdDelta = (new Date) - Date.parse(repo.created_at);

          var weightForPush = 1;
          var weightForWatchers = 1.314 * Math.pow(10, 7);

          repo.hotness = weightForPush * Math.pow(Math.E, -1 * weekHalfLife * pushDelta);
          repo.hotness += weightForWatchers * repo.watchers / createdDelta;
        });

        // Sort by highest # of watchers.
        repos.sort(function (a, b) {
          if (a.hotness < b.hotness) return 1;
          if (b.hotness < a.hotness) return -1;
          return 0;
        });

        $.each(repos, function (i, repo) {
          if (repo.name && $.inArray(repo.name, RWOss.reposExclude) === -1){
            RWOss.repos.push(repo);
          }
        });

        // Sort by most-recently pushed to.
        repos.sort(function (a, b) {
          if (a.pushed_at < b.pushed_at) return 1;
          if (b.pushed_at < a.pushed_at) return -1;
          return 0;
        });

        $.each(repos, function (i, repo) {
          if (repo.name && $.inArray(repo.name, RWOss.reposExclude) === -1){
            RWOss.recentlyUpdatedRepos.push(repo);
          }
        });
      
        // render all repos
        RWOss.renderAll();
        
      });
    });
    
    $.getJSON("https://api.github.com/orgs/railsware/members?callback=?", function (result) {
      var members = result.data;

      $(function () {
        $("h1.count_of_members").text(members.length);
      });
    });
  },
  
  renderAll: function(){
    RWOss.renderRepos();
    RWOss.renderRecentlyUpdatedRepo();
  },
  
  renderRepos: function(){
    // count
    $('h1.count_public_repos').text(RWOss.repos.length);
    // repos
    $('#reposList').empty();
    
    var repoTemplate = $('#repoTemplate').html();
    if (RWOss.repos.length > 0){
      $.each(RWOss.repos, function (i, repo) {
        switch (repo.language) {
          case "JavaScript":
            repo.css_lang = "js";
            break;
          case "CoffeeScript":
            repo.css_lang = "coffee";
            break;
          case "Shell":
            repo.css_lang = "shell";
            break;
          case "Python":
            repo.css_lang = "python";
            break;
          case "C++":
            repo.css_lang = "cpp";
            break;
          case "PHP":
            repo.css_lang = "php";
            break;
          default:
            repo.css_lang = "ruby";
        }
        // Какого х*я в "scaffy" делает ruby. Хотя мне пофиг
        if ($.inArray(repo.name, ["scaffy", "Reset.css"]) !== -1){
          repo.css_lang = "css";
        }
        
        // Бля, ну зачем тут аж 3(!!!) разных класса???
        if (i % 4 === 0 || 0 === i){
          repo.block_class = "prl";
        } else if (0 !== i){
          if ((i - 1) % 2 === 0 && (i - 1) % 4 !== 0){
            repo.block_class = "pll";
          } else {
            repo.block_class = "prm";
          }
        }
        
        $('#reposList').append(Mustache.render(repoTemplate, repo));
        
        // бздюльку не забываем
        if (0 !== i && 0 === (i + 1) % 4){
          $('#reposList').append('<div class="clear"></div>');
        }
      });
    }
  },
  
  renderRecentlyUpdatedRepo: function(){
    var repoTemplate = $('#repoResentlyUpdatedTemplate').html();
    var reposContent = [];
    $.each(RWOss.recentlyUpdatedRepos.slice(0, 3), function (i, repo) {
      reposContent.push(Mustache.render(repoTemplate, repo));
    });
    $('#resentlyUpdatedRepos').empty().html(reposContent.join(""));
  }
};

$(function() {
  RWOss.init();
});

/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.method == 'POST') {
    req.session['name'] = req.body.name;
  }
  res.render('index', { title: 'Express' });
};
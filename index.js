var mysql = require('mysql');
var bodyParser = require('body-parser');
var express = require('express');
var cryptr = require('cryptr');
var crypto = require("crypto");
var session = require('express-session');
var fs = require('fs');
var app = express();

var connection = mysql.createConnection({
    host: 'www.db4free.net',
    user: 'wearlong',
    password: 'lctms6d02',
    database: 'wearlong'
});

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected");
    } else {
        console.log("Error while connecting with database");
    }
});
app.listen(3000);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));


//set session
app.use(session({
    cookie: { maxAge: 600 * 6000 },
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

//Get json file
function readJsonFileSync(filepath, encoding) {

    if (typeof (encoding) == 'undefined') {
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getConfig(file) {

    var filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}

var recipesJson = getConfig('recipes.json');

//Index
app.get('/index', function (req, res) {
    if (req.session.userid) {
        res.render('index', {
            index_logtext: req.session.username,
            index_loghref: "/profile"
        });
    } else {
        res.render('index', {
            index_logtext: "Login/Register",
            index_loghref: "/login"
        });
    }
})

//Login
app.get('/login', function (req, res) {
    res.render('login');
})

cryptr = new cryptr('mySecertKey');

app.post('/loginPart', function (req, res) {
    var email = req.body.login_email;
    var password = req.body.login_password;

    connection.query('SELECT * FROM user WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            res.json({
                status: false,
                message: '404'
            })
        } else {
            if (results.length > 0) {
                decryptedString = cryptr.decrypt(results[0].password);
                if (password == decryptedString) {
                    req.session.userid = results[0].userid;
                    req.session.username = results[0].username;
                    return res.redirect('/profile');
                } else {
                    res.render('login', {
                        logintext: 'Email and password does not match!!'
                    });
                }
            } else {
                res.render('login', {
                    logintext: 'Email does not register!!'
                });
            }
        }
    });
});

//Register
app.post('/registerPart', function (req, res) {
    var encryptedString = cryptr.encrypt(req.body.register_password);
    var user = {
        "userid": crypto.randomBytes(10).toString('hex'),
        "email": req.body.register_email,
        "username": req.body.register_username,
        "password": encryptedString
    }
    connection.query('INSERT INTO user SET ?', user, function (error, results, fields) {
        if (error) {
            res.render('login', {
                registertext: "Email have been used !!"
            });
        } else {
            res.render('login', {
                registertext: "Register SuccessFul, You can Login now !!"
            });
        }
    });
});

//Logout
app.get('/logout', function (req, res) {
    req.session.destroy();
    return res.redirect('/login');
});

//Profile
app.get('/profile', function (req, res) {
    if (req.session.userid) {
        //get update list
        var recipesUserRecordJson = getConfig('recipesUserRecord.json');
        var update_html = null
        var keys_update = Object.keys(recipesUserRecordJson.recipesUserRecord);
        for (var i = 0; i < keys_update.length; i++) {
            if (keys_update[i].includes(req.session.userid)) {
                var userRecord = recipesUserRecordJson.recipesUserRecord[keys_update[i]]
                var userkeys = Object.keys(userRecord)
                for (var k = 0; k < userkeys.length; k++) {
                    if (update_html == null) {
                        update_html = '<li>' +
                            '<div class="media">' +
                            '<div class="media-body">' +
                            '<h4>' + userkeys[k] + '</h4>' +
                            '<p>' + userRecord[userkeys[k]] + '</p>' +
                            '<a href="" id="' + userkeys[k] + '" class="delete-btn">Delete</a>' +
                            '<a href="/update=' + userkeys[k] + '" class="update-btn">Update</a>' +
                            '</div>' +
                            '</div>' +
                            '</li>'
                    } else {
                        update_html = update_html +
                            '<li>' +
                            '<div class="media">' +
                            '<div class="media-body">' +
                            '<h4>' + userkeys[k] + '</h4>' +
                            '<p>' + userRecord[userkeys[k]] + '</p>' +
                            '<a href="" id="' + userkeys[k] + '" class="delete-btn">Delete</a>' +
                            '<a href="/update=' + userkeys[k] + '" class="update-btn">Update</a>' +
                            '</div>' +
                            '</div>' +
                            '</li>'
                    }
                }
            }
        }
        var recipesFavoriteListRecordJson = getConfig('recipesFavoriteList.json');
        var favorite_html = null
        var keys_favorite = Object.keys(recipesFavoriteListRecordJson.recipesFavoriteList);
        for (var i = 0; i < keys_favorite.length; i++) {
            if (keys_favorite[i].includes(req.session.userid)) {
                var userRecord = recipesFavoriteListRecordJson.recipesFavoriteList[keys_favorite[i]]
                var userkeys = Object.keys(userRecord)
                for (var k = 0; k < userkeys.length; k++) {
                    if (favorite_html == null) {
                        favorite_html = '<li>' +
                            '<div class="media">' +
                            '<div class="media-left">' +
                            '<img class="media-img" src="img/recipeImg/' + userkeys[k] + '.jpg">' +
                            '</div>' +
                            '<div class="media-body">' +
                            '<h4>' + userkeys[k] + '</h4>' +
                            '<p>' + userRecord[userkeys[k]] + '</p>' +
                            '<a href="" id="' + userkeys[k] + 
                            '" class="favorite-delete-btn">Delete</a>' +
                            '</div>' +
                            '</div>' +
                            '</li>'
                    } else {
                        favorite_html = favorite_html +
                            '<li>' +
                            '<div class="media">' +
                            '<div class="media-left">' +
                            '<img class="media-img" src="img/recipeImg/' + userkeys[k] + '.jpg">' +
                            '</div>' +
                            '<div class="media-body">' +
                            '<h4>' + userkeys[k] + '</h4>' +
                            '<p>' + userRecord[userkeys[k]] + '</p>' +
                            '<a href="" id="' + userkeys[k] + 
                            '" class="favorite-delete-btn">Delete</a>' +
                            '</div>' +
                            '</div>' +
                            '</li>'
                    }
                }
            }
        }
        res.render('profile', {
            profile_nametext: req.session.username,
            profile_updateList: update_html,
            profile_favoriteList: favorite_html
        });
    } else {
        res.render('login');
    }
})

app.put('/profile', function (req, res) {
    if (req.session.userid) {
        if (req.session.username == req.body.username) {
            res.render('profile', {
                profile_nametext: req.session.username
            });
        } else {
            var sql = 'UPDATE user SET username = ? WHERE userid = ?';
            var data = [req.body.username, req.session.userid];
            connection.query(sql, data, (error, results, fields) => {
                if (error) {
                    res.json({
                        status: false,
                        message: '404'
                    })
                } else {
                    req.session.username = req.body.username;
                    res.render('profile', {
                        profile_nametext: req.session.username
                    });
                }
            });
        }
    } else {
        res.render('login');
    }
})

//Search
app.get('/search', function (req, res) {
    var keys = Object.keys(recipesJson.recipes);
    var html = null
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].includes(req.query.search_text)) {
            if (html == null) {
                html = '<a href="/recipe=' + keys[i] + '">' +
                    '<li>' +
                    '<div class="media">' +
                    '<div class="media-left">' +
                    '<img class="media-object recipe-img" src="img/recipeImg/' + keys[i] + '.jpg">' +
                    '</div>' +
                    '<div class="media-body">' +
                    '<h4>' + keys[i] + '</h4>' +
                    '<p>' + recipesJson.recipes[keys[i]].Description + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '</a>'
            } else {
                html = html + '<a href="/recipe=' + keys[i] + '">' +
                    '<li>' +
                    '<div class="media">' +
                    '<div class="media-left">' +
                    '<img class="media-object recipe-img" src="img/recipeImg/' + keys[i] + '.jpg">' +
                    '</div>' +
                    '<div class="media-body">' +
                    '<h4>' + keys[i] + '</h4>' +
                    '<p>' + recipesJson.recipes[keys[i]].Description + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '</a>'
            }
        }
    }
    if (req.session.userid) {
        res.render('search', {
            search_logtext: req.session.username,
            search_loghref: "/profile",
            searchResult: req.query.search_text,
            listHtml: html
        });
    } else {
        res.render('search', {
            search_logtext: "Login/Register",
            search_loghref: "/login",
            searchResult: req.query.search_text,
            listHtml: html
        });
    }
})

//Recipe Page
app.get('/recipe=:recipename', function (req, res) {
    var btn_class
    if(req.session.userid) {
        var favorite_title = req.params.recipename;
        var dataFavoriteRecord = fs.readFileSync('recipesFavoriteList.json');
        var recipesFavoriteListJson = JSON.parse(dataFavoriteRecord);
        if (recipesFavoriteListJson['recipesFavoriteList'][req.session.userid] == undefined) {
            btn_class = "fa-heart-o"
        } else {
            if (recipesFavoriteListJson['recipesFavoriteList'][req.session.userid][favorite_title] == undefined) {
                btn_class = "fa-heart-o"
            } else {
                btn_class = "fa-heart"
            }
        }
    } else {
        btn_class = "fa-heart-o"
    }
    var title, desc
    var ingred, step
    title = req.params.recipename;
    desc = recipesJson.recipes[req.params.recipename].Description


    var ingredLength = recipesJson.recipes[req.params.recipename].Ingredients.length
    for (var i = 0; i < ingredLength; i++) {
        if (i == 0) {
            ingred = '<li>' +
                recipesJson.recipes[req.params.recipename].Ingredients[i] +
                '</li>'
        } else {
            ingred = ingred +
                '<li>' +
                recipesJson.recipes[req.params.recipename].Ingredients[i] +
                '</li>'
        }
    }

    var stepLength = recipesJson.recipes[req.params.recipename].Steps.length
    for (var i = 0; i < stepLength; i++) {
        if (i == 0) {
            step = '<li>' +
                recipesJson.recipes[req.params.recipename].Steps[i] +
                '</li>'
        } else {
            step = step +
                '<br>' +
                '<li>' +
                recipesJson.recipes[req.params.recipename].Steps[i] +
                '</li>'
        }
    }

    var imghref = "/img/recipeImg/" + title + ".jpg"

    if (req.session.userid) {
        res.render('recipe', {
            recipe_logtext: req.session.username,
            recipe_loghref: "/profile",
            recipe_recipetext: title,
            recipe_desctext: desc,
            recipe_ingredHtml: ingred,
            recipe_stepHtml: step,
            recipe_recipeImg: imghref,
            recipe_favoriteState: btn_class
        });
    } else {
        res.render('recipe', {
            recipe_logtext: "Login/Register",
            recipe_loghref: "/login",
            recipe_recipetext: title,
            recipe_desctext: desc,
            recipe_ingredHtml: ingred,
            recipe_stepHtml: step,
            recipe_recipeImg: imghref,
            recipe_favoriteState: btn_class
        });
    }
})

//Create
app.get('/create', function (req, res) {
    if (req.session.userid) {
        res.render('create', {
            create_logtext: req.session.username,
            create_loghref: "/profile"
        });
    } else {
        res.render('login');
    }
})

app.post('/create', function (req, res) {
    if (req.session.userid) {
        //Set user recipe
        var tempTitle = req.body.recipeTitle;
        var tempDesc = req.body.recipeDesc;

        var text = {};
        text = {
            "Description": tempDesc,
            "Ingredients": [

            ],
            "Steps": [

            ]
        }

        var tempIngred = [];
        var tempIngredLength = req.body.recipeIngred.length;
        for (var i = 0; i < tempIngredLength; i++) {
            tempIngred[i] = req.body.recipeIngred[i]
            text.Ingredients.push(tempIngred[i])
        }

        var tempStep = [];
        var tempStepLength = req.body.recipeStep.length;
        for (var i = 0; i < tempStepLength; i++) {
            tempStep[i] = req.body.recipeStep[i]
            text.Steps.push(tempStep[i])
        }

        var data = fs.readFileSync('recipesUser.json');
        var recipesUserJson = JSON.parse(data);
        recipesUserJson['recipesUser'][tempTitle] = text

        fs.writeFile("recipesUser.json", JSON.stringify(recipesUserJson), function (err) {
            console.log(recipesUserJson)
        });

        //set user recipe record
        var dataRecord = fs.readFileSync('recipesUserRecord.json');
        var recipesUserRecordJson = JSON.parse(dataRecord);
        var text2 = {};

        if (recipesUserRecordJson['recipesUserRecord'][req.session.userid] == undefined) {
            recipesUserRecordJson['recipesUserRecord'][req.session.userid] = {}
            text2[tempTitle] = tempDesc;
            recipesUserRecordJson['recipesUserRecord'][req.session.userid] = text2
        } else {
            recipesUserRecordJson['recipesUserRecord'][req.session.userid][tempTitle] = tempDesc
        }

        fs.writeFile("recipesUserRecord.json", JSON.stringify(recipesUserRecordJson), function (err) {
            console.log(recipesUserRecordJson)
        });
    } else {
        res.render('login');
    }
})

//Update
app.get('/update=:title', function (req, res) {
    if (req.session.userid) {
        var userRecipes = JSON.parse(fs.readFileSync('recipesUser.json'));

        var updateIngredHtml
        var ingredLength = userRecipes['recipesUser'][req.params.title].Ingredients.length;

        for (var i = 0, k = 1; i < ingredLength; i++ , k++) {
            if (i == 0) {
                updateIngredHtml = '<div id="ingred' + k + '">' +
                    '<input type="text" placeholder="Ingredient ' + k +
                    '" id="form_recipeingred' + k +
                    '" value="' + userRecipes['recipesUser'][req.params.title].Ingredients[i] +
                    '"></div>'
            } else {
                updateIngredHtml = updateIngredHtml + '<div id="ingred' + k + '">' +
                    '<input type="text" placeholder="Ingredient ' + k +
                    '" id="form_recipeingred' + k +
                    '" value="' + userRecipes['recipesUser'][req.params.title].Ingredients[i] +
                    '"><button class="fa fa-minus-square delete-ingredient-field">' +
                    '</button></div>'
            }
        }

        var updateStepHtml
        var stepLength = userRecipes['recipesUser'][req.params.title].Steps.length;

        for (var i = 0, k = 1; i < stepLength; i++ , k++) {
            if (i == 0) {
                updateStepHtml = '<div id="step' + k +
                    '"><input type="text" placeholder="Step ' + k +
                    '" id="form_recipestep' + k +
                    '" value="' + userRecipes['recipesUser'][req.params.title].Steps[i] +
                    '"></div>'
            } else {
                updateStepHtml = updateStepHtml + '<div id="step' + k +
                    '"><input type="text" placeholder="Step ' + k +
                    '" id="form_recipestep' + k +
                    '" value="' + userRecipes['recipesUser'][req.params.title].Steps[i] +
                    '"><button class="fa fa-minus-square delete-step-field"></button></div>'
            }
        }

        res.render('update', {
            update_logtext: req.session.username,
            update_loghref: "/profile",
            update_title: req.params.title,
            update_description: userRecipes['recipesUser'][req.params.title].Description,
            update_ingred: updateIngredHtml,
            update_step: updateStepHtml
        });
    } else {
        res.render('login');
    }
})

app.put('/update', function (req, res) {
    if (req.session.userid) {
        //Set user recipe
        var tempTitle = req.body.update_recipeTitle;
        var tempDesc = req.body.update_recipeDesc;


        var text = {};
        text = {
            "Description": tempDesc,
            "Ingredients": [

            ],
            "Steps": [

            ]
        }

        var tempIngred = [];
        var tempIngredLength = req.body.update_recipeIngred.length;
        for (var i = 0; i < tempIngredLength; i++) {
            tempIngred[i] = req.body.update_recipeIngred[i]
            text.Ingredients.push(tempIngred[i])
        }

        var tempStep = [];
        var tempStepLength = req.body.update_recipeStep.length;
        for (var i = 0; i < tempStepLength; i++) {
            tempStep[i] = req.body.update_recipeStep[i]
            text.Steps.push(tempStep[i])
        }

        var data = fs.readFileSync('recipesUser.json');
        var recipesUserJson = JSON.parse(data);
        recipesUserJson['recipesUser'][tempTitle] = text

        fs.writeFile("recipesUser.json", JSON.stringify(recipesUserJson), function (err) {
            console.log(recipesUserJson)
        });

        //set user recipe record
        var dataRecord = fs.readFileSync('recipesUserRecord.json');
        var recipesUserRecordJson = JSON.parse(dataRecord);
        var text2 = {};

        if (recipesUserRecordJson['recipesUserRecord'][req.session.userid] == undefined) {
            recipesUserRecordJson['recipesUserRecord'][req.session.userid] = {}
            text2[tempTitle] = tempDesc;
            recipesUserRecordJson['recipesUserRecord'][req.session.userid] = text2
        } else {
            recipesUserRecordJson['recipesUserRecord'][req.session.userid][tempTitle] = tempDesc
        }

        fs.writeFile("recipesUserRecord.json", JSON.stringify(recipesUserRecordJson), function (err) {
            console.log(recipesUserRecordJson)
        });
    } else {
        res.render('login');
    }
})

//Delete
app.delete('/delete=:title', function (req, res) {
    if (req.session.userid) {
        var data = fs.readFileSync('recipesUser.json');
        var recipesUserJson = JSON.parse(data);
        delete recipesUserJson['recipesUser'][req.params.title]
        var dataRecord = fs.readFileSync('recipesUserRecord.json');
        var recipesUserRecordJson = JSON.parse(dataRecord);
        delete recipesUserRecordJson['recipesUserRecord'][req.session.userid][req.params.title]
        fs.writeFile("recipesUser.json", JSON.stringify(recipesUserJson), function (err) {
            console.log(recipesUserJson)
        });
        fs.writeFile("recipesUserRecord.json", JSON.stringify(recipesUserRecordJson), function (err) {
            console.log(recipesUserRecordJson)
        });
        res.render('profile')
    } else {
        res.render('login');
    }
})

//Add FavoriteList
app.post('/favorite_insert', function (req, res) {
    if (req.session.userid) {
        var favorite_title = req.body.recipe;
        var favorite_desc = recipesJson.recipes[req.body.recipe].Description;
        var dataFavoriteRecord = fs.readFileSync('recipesFavoriteList.json');
        var recipesFavoriteListJson = JSON.parse(dataFavoriteRecord);
        var text3 = {};
        if (recipesFavoriteListJson['recipesFavoriteList'][req.session.userid] == undefined) {
            recipesFavoriteListJson['recipesFavoriteList'][req.session.userid] = {}
            text3[favorite_title] = favorite_desc;
            recipesFavoriteListJson['recipesFavoriteList'][req.session.userid] = text3
        } else {
            recipesFavoriteListJson['recipesFavoriteList'][req.session.userid][favorite_title] = favorite_desc
        }

        fs.writeFile("recipesFavoriteList.json", JSON.stringify(recipesFavoriteListJson), function (err) {
            console.log(recipesFavoriteListJson)
        });
    } else {
        res.render('login');
    }
})

//Delete FavoriteList Recipe
app.delete('/favorite_delete_recipepage', function (req, res) {
    if (req.session.userid) {
        var data = fs.readFileSync('recipesFavoriteList.json');
        var recipesFavoriteListJson = JSON.parse(data);
        delete recipesFavoriteListJson['recipesFavoriteList'][req.session.userid][req.body.recipe]
        fs.writeFile("recipesFavoriteList.json", JSON.stringify(recipesFavoriteListJson), function (err) {
            console.log(recipesFavoriteListJson)
        });
    } else {
        res.render('login');
    }
})

//Delete FavoriteList Profile
app.delete('/favorite_delete_profilepage=:title', function (req, res) {
    if (req.session.userid) {
        var data = fs.readFileSync('recipesFavoriteList.json');
        var recipesFavoriteListJson = JSON.parse(data);
        delete recipesFavoriteListJson['recipesFavoriteList'][req.session.userid][req.params.title]
        fs.writeFile("recipesFavoriteList.json", JSON.stringify(recipesFavoriteListJson), function (err) {
            console.log(recipesFavoriteListJson)
        });
        res.render('profile');
    } else {
        res.render('login');
    }
})
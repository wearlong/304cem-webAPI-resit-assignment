$(document).ready(function () {
    var max_fields = 20;
    var wrapper_ingredient = $(".aa-create-ingredient-inline");
    var add_button_ingredient = $(".add-ingredient-field");
    var wrapper_step = $(".aa-create-step-inline");
    var add_button_step = $(".add-step-field");
    var input_username = $("#aa-profile-userinfor-username");
    var create_btn = $("#create_recipe_btn");
    var update_btn = $("#update_recipe_btn");
    var delete_btn = $(".delete-btn");
    var delete_btn_favorite = $(".favorite-delete-btn");

    //Favorite Button
    $('.head-banner-click').click(function () {
        var state = document.getElementById('login_state').textContent;
        if (state == "Login/Register") {
            alert('Please Login First')
        } else {
            var params = {}
            if ($('.head-banner-click span').hasClass("fa-heart")) {
                $('.head-banner-click').removeClass('active')
                setTimeout(function () {
                    $('.head-banner-click').removeClass('active-2')
                }, 30)
                $('.head-banner-click').removeClass('active-3')
                setTimeout(function () {
                    $('.head-banner-click span').removeClass('fa-heart')
                    $('.head-banner-click span').addClass('fa-heart-o')
                }, 15)

                var recipeName = document.getElementById('recipe_title_text').textContent;
                var data = { recipe: recipeName }
                params.url = '/favorite_delete_recipepage';
                params.type = 'DELETE';
                params.data = JSON.stringify(data);
                params.contentType = "application/json";
                params.processData = false;
            } else {
                $('.head-banner-click').addClass('active')
                $('.head-banner-click').addClass('active-2')
                setTimeout(function () {
                    $('.head-banner-click span').addClass('fa-heart')
                    $('.head-banner-click span').removeClass('fa-heart-o')
                }, 150)
                setTimeout(function () {
                    $('.head-banner-click').addClass('active-3')
                }, 150)
                $('.head-banner-click .head-banner-info').addClass('head-banner-info-tog')
                setTimeout(function () {
                    $('.head-banner-click .head-banner-info').removeClass('head-banner-info-tog')
                }, 1000)

                var recipeName = document.getElementById('recipe_title_text').textContent;
                var data = { recipe: recipeName }
                params.url = '/favorite_insert';
                params.type = 'POST';
                params.data = JSON.stringify(data);
                params.contentType = "application/json";
                params.processData = false;
            }
            $.ajax(params);
        }
    })

    //Profile Delete Button favorite
    $(delete_btn_favorite).click(function (m) {
        var temp = m.target.id
        $.ajax({
            url: '/favorite_delete_profilepage=' + temp,
            type: 'DELETE',
            processData: false
        });
    })

    //Profile Delete Button
    $(delete_btn).click(function (q) {
        var temp = q.target.id
        $.ajax({
            url: '/delete=' + temp,
            type: 'DELETE',
            processData: false
        });
    })

    //Add Ingredient input
    var x = 1;
    $(add_button_ingredient).click(function (e) {
        e.preventDefault();
        if (x < max_fields) {
            for (var i = 1; i < max_fields; i++) {
                if (document.getElementById("ingred" + i) == null) {
                    if (i - 1 != x) {
                        x = i - 1;
                        x++;
                        $(wrapper_ingredient).append('<div id="ingred' + x + '"><input type="text" placeholder="Ingredient ' + x + '" id="form_recipeingred' + x + '"><button class="fa fa-minus-square delete-ingredient-field"></button></div>');
                        return;
                    } else {
                        x++;
                        $(wrapper_ingredient).append('<div id="ingred' + x + '"><input type="text" placeholder="Ingredient ' + x + '" id="form_recipeingred' + x + '"><button class="fa fa-minus-square delete-ingredient-field"></button></div>');
                        return;
                    }
                }
            }
        } else {
            alert('You Reached the limits')
        }
    });

    //Delete Ingredient input
    $(wrapper_ingredient).on("click", ".delete-ingredient-field", function (e) {
        e.preventDefault();
        if (x == 1) {
            for (var i = max_fields; i > 1; i--) {
                if (document.getElementById("ingred" + i) == null) {
                } else {
                    x = i;
                    var elem = document.getElementById("ingred" + x);
                    elem.remove();
                    x--;
                    return;
                }
            }
        } else {
            var elem = document.getElementById("ingred" + x);
            elem.remove();
            x--;
            return;
        }
    })

    //Add Step input
    var y = 1;
    $(add_button_step).click(function (k) {
        k.preventDefault();
        if (y < max_fields) {
            for (var i = 1; i < max_fields; i++) {
                if (document.getElementById("step" + i) == null) {
                    if (i - 1 != y) {
                        y = i - 1;
                        y++;
                        $(wrapper_step).append('<div id="step' + y + '"><input type="text" placeholder="Step ' + y + '" id="form_recipestep' + y + '"><button class="fa fa-minus-square delete-step-field"></button></div>');
                        return;
                    } else {
                        y++;
                        $(wrapper_step).append('<div id="step' + y + '"><input type="text" placeholder="Step ' + y + '" id="form_recipestep' + y + '"><button class="fa fa-minus-square delete-step-field"></button></div>');
                        return;
                    }
                }
            }
        } else {
            alert('You Reached the limits')
        }
    });

    //Delete Step input
    $(wrapper_step).on("click", ".delete-step-field", function (k) {
        k.preventDefault();
        if (y == 1) {
            for (var i = max_fields; i > 1; i--) {
                if (document.getElementById("step" + i) == null) {
                } else {
                    y = i;
                    var elem = document.getElementById("step" + y);
                    elem.remove();
                    y--;
                    return;
                }
            }
        } else {
            var elem = document.getElementById("step" + y);
            elem.remove();
            y--;
            return;
        }
    })

    //Save Username Profile
    $(input_username).on('focusout', function (j) {
        var name = document.getElementById("aa-profile-userinfor-username").value;
        var text = { username: name };

        $.ajax({
            url: '/profile',
            type: 'PUT',
            data: JSON.stringify(text),
            contentType: "application/json",
            processData: false
        });
    })

    //Create Recipe
    $(create_btn).click(function (a) {
        a.preventDefault();
        var title = document.getElementById("create_recipeTitle").value;
        var desc = document.getElementById("create_recipedesc").value;
        
        if (title == "") {
            alert('Title must not be null');
            return;
        }
        if (desc == "") {
            alert('Descript must not be null');
            return;
        }

        var ingred = [], step = []
        for (var i = 0, count = 1; count < max_fields; i++ , count++) {
            var tempA = document.getElementById("form_recipeingred" + count);
            if (tempA == null) {
                break;
            } else {
                if (tempA.value == "") {
                    alert('Ingredient must not be null');
                    return;
                } else {
                    ingred[i] = tempA.value;
                }
            }
        }

        for (var i = 0, count = 1; count < max_fields; i++ , count++) {
            var tempB = document.getElementById("form_recipestep" + count);
            if (tempB == null) {
                break;
            } else {
                if (tempB.value == "") {
                    alert('Step must not be null');
                    return;
                } else {
                    step[i] = tempB.value;
                }
            }
        }

        var data = {
            recipeTitle: title,
            recipeDesc: desc,
            recipeIngred: ingred,
            recipeStep: step
        };

        $.ajax({
            url: '/create',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false
        });

        window.location.replace('/profile');
    });

    //Update Recipe
    $(update_btn).click(function (p) {
        p.preventDefault();
        var title = document.getElementById("update_recipeTitle").value;
        var desc = document.getElementById("update_recipedesc").value;

        if (title == "") {
            alert('Title must not be null');
            return;
        }
        if (desc == "") {
            alert('Descript must not be null');
            return;
        }

        var ingred = [], step = []
        for (var i = 0, count = 1; count < max_fields; i++ , count++) {
            var tempA = document.getElementById("form_recipeingred" + count);
            if (tempA == null) {
                break;
            } else {
                if (tempA.value == "") {
                    alert('Ingredient must not be null');
                    return;
                } else {
                    ingred[i] = tempA.value;
                }
            }
        }

        for (var i = 0, count = 1; count < max_fields; i++ , count++) {
            var tempB = document.getElementById("form_recipestep" + count);
            if (tempB == null) {
                break;
            } else {
                if (tempB.value == "") {
                    alert('Step must not be null');
                    return;
                } else {
                    step[i] = tempB.value;
                }
            }
        }

        var data = {
            update_recipeTitle: title,
            update_recipeDesc: desc,
            update_recipeIngred: ingred,
            update_recipeStep: step
        };

        $.ajax({
            url: '/update',
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false
        });

        window.location.replace('/profile');
    });
});
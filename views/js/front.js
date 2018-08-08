/**
 * 2007-2017 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 *  @author    PrestaShop SA <contact@prestashop.com>
 *  @copyright 2007-2017 PrestaShop SA
 *  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 *  International Registered Trademark & Property of PrestaShop SA
 *
 * Don't forget to prefix your containers with your own identifier
 * to avoid any conflicts with others containers.
 */

 
var SpeedboxCity = function(options) {
    var vars = {
        city: 'city',
        selected: '',
        options: '',
    };
    this.construct = function(options) {
        vars.options = options;
        vars.selected = $('#city').val();
        //changeCityToSelect();
    };
    this.changeCityToSelect = function() {
        changeCityToSelect();
    };
    var changeCityToSelect = function() {
        $('#' + vars.city).replaceWith(generateCity(vars.options, vars.selected));
        $('#' + vars.city).innerHTML;

    };
    var generateCity = function(options, selected) {
        var html = '<select name="city" id="city" data-validate="isCityName" class="form-control" title="City" >';
        html += generateSelectOptionsHtml(options, selected);
        return html;
    };
    var generateSelectOptionsHtml = function(options, selected) {
        var html = '';
        var selectedHtml;
        for (var key in options) {
            var value = options[key];
            if (selected instanceof Array) {
                if (selected.indexOf(key) != -1) {
                    selectedHtml = ' selected="selected"';
                } else {
                    selectedHtml = '';
                }
            } else {
                if (key == selected) {
                    selectedHtml = ' selected="selected"';
                } else {
                    selectedHtml = '';
                }
            }
            html += '<option value="' + key + '"' + selectedHtml + '>' + value + '</option>';
        }
        html += '</select>';
        return html;
    };
    this.construct(options);
};

var Speedbox = function(ajaxurl, methodradioButton) {
    var vars = {
        city: '',
        ajaxurl: '',
        methodradioButton: '',
        divconteneur: '',
        method: '',
        relais_data: '',
        type_livraison : '',
    };
    this.construct = function(ajaxurl, methodradioButton) {
        vars.ajaxurl = ajaxurl;
        vars.methodradioButton = methodradioButton;
        vars.divconteneur = 'speedbox_relais';
    };
    this.isDivconteneurExist = function() {
        if (!($('#speedbox_please_wait').length) || !($('#' + vars.divconteneur).length)) {
            AddDivPR();
            addButtonEven();
        }
    }
    this.setCity = function(city) {
        vars.city = city;
        AddDivPR();
        addButtonEven();
        ifBouttonSpeeedboxChecked();
    };

    var updateMode = function(){
        var modes = document.getElementsByName("btnmode");
        var container = document.getElementById("speedbox_relais_container");
        var val = '';
        for (var i=0, len=modes.length; i<len; i++) {
            if(modes[i].checked){
                vars.type_livraison = modes[i].value;
            }
        }
        if (vars.type_livraison == '100'){
            getSpeedboxCities();
            ajaxPointsRelais();
            //container.style.display = "block";
        }
        else {
            $("#speedbox_relais_container").empty();
            //container.style.display = "none";
            setCookie('type_livraison', vars.type_livraison); 
            ajaxlivraisonDomicile(vars.city);
        }    
    };

     var getPointsRelais = function() {
        var modes = document.getElementsByName("btnmode");
        var val = '';
        for (var i=0, len=modes.length; i<len; i++) {
            modes[i].addEventListener("click", function () {
                updateMode();
            });
            
        }
    };

    var AddDivPR = function() {
        divelemt = '<div id="speedbox_please_wait" name="speedbox_wait" class="speedbox_wait" style="display:none;"></div><div id="' + vars.divconteneur + '"></div>';
        vars.method = $("#" + vars.methodradioButton).closest('div.delivery_option');
        vars.method.after(divelemt);
        $("#" + vars.divconteneur).hide();
        mode_choice = '<table class="table table-responsive table-bordered table-hover" width="100%"><tr><td align="center"><input type="radio"  name="btnmode" value="100"/></td> <td align="right" class="speedbox_mode"> Livraison en Point Relais </td></tr>  <tr><td align="center"><input type="radio"  name="btnmode" value="200"/></td><td align="right" class="speedbox_mode"> Livraison à domicile </td></tr></table>';
        vars.method.after(mode_choice);
    };
    var ifBouttonSpeeedboxChecked = function() {
        if ($("#" + vars.methodradioButton).prop('checked')) {
            getPointsRelais();
        }
    };
    var addButtonEven = function() {
        $("input[name*='delivery_option[']").each(function() {
            $(this).change(function(event) {
                speedboxCheck();
            });
        });
    };
    var speedboxCheck = function() {
        if ($("input[id*='" + vars.methodradioButton + "']").length != 0) {
            if ($("#" + vars.methodradioButton).prop('checked')) {
                getPointsRelais();
            } else {
                $("#" + vars.divconteneur).hide();
            }
        }
    };

    var getSpeedboxCities = function(){
        $("#select_city").empty();
        $.ajax({
        url: "https://api.speedbox.ma/api/listevilles/",
        type: "POST",
        crossDomain: true,
        headers: {"Access-Control-Request-Headers": "*"},
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            data.sort();
            $.each( data, function(key,val ) {
                if(val == vars.city){
                    $("#select_city").append('<option value="'+val+'" selected>'+val+'</option>');
                }
                else {
                    $("#select_city").append('<option value="'+val+'">'+val+'</option>');
                }
            });
            $("#select_city").on("change", function(){
                changeCity($('#select_city').find(":selected").text());
            });
        },
        error: function (xhr, status) {
            alert("error");
        }
    });
    }

    var changeCity = function(city){
        vars.city = city;
        ajaxPointsRelais();

    }
   

    var ajaxlivraisonDomicile = function(city){
        $.ajax(vars.ajaxurl, {
            data: {
                'PR_infos': '{"relay_id": "LAD200" ,"shop_name": "", "address":"adresse a domicile","postcode":"20000","city":"' + vars.city + '","type":"'+ vars.type_livraison +'"}',
                'city': city,
                'id': 200,
                'type_livraison': vars.type_livraison,
            },
            success: function(data) {
                setCookie('type_livraison', vars.type_livraison);   
            },
            error: function() {
                alert('Something went wrong...');
            },
        });
    }

    var ajaxPointsRelais = function(setRequest = false, PR_id = '', PR_infos = '') {
        var wait = (setRequest) ? '#speedbox_please_wait_relais' : '#speedbox_please_wait';
        var city = (setRequest) ? 0 : vars.city;
        var type_livraison = (setRequest) ? 100 : vars.type_livraison;
        $(wait).show();
        getSpeedboxCities();
        $.ajax(vars.ajaxurl, {
            data: {
                'PR_infos': PR_infos,
                'city': city,
                'id': $("#" + vars.methodradioButton).val(),
                'type_livraison': vars.type_livraison,
            },
            success: function(data) {
                var html = data;
                if (setRequest) {
                    $('#speedbox_relais_selected').html(html);
                    setCookie('sb_relay_id', PR_id);
                    setCookie('type_livraison', type_livraison);   
                } else {
                    $("#" + vars.divconteneur).html(html);
                    $("#" + vars.divconteneur).show();
                    if ($("input[name='sb_relay_id']").length != 0) {
                        checkOnePoint();
                    }
                }
                $(wait).hide();  
            },
            error: function() {
                $(wait).hide();
                alert('Something went wrong...');
            },
        });
    };

    var checkOnePoint = function() {
        radiochecked = '';
        relay_id = getCookie('sb_relay_id');
        if (relay_id && $("#" + relay_id) != "undefined" && $("#" + relay_id) != null) {
            $("#" + relay_id).prop("checked", true);
            radiochecked = relay_id;
        }
        if ($("input[name='sb_relay_id']:checked").length == 0) {
            $("input[name='sb_relay_id']")[0].prop("checked", true);
            radiochecked = $("input[name='sb_relay_id']")[0].id;
        } else {
            radiochecked = $("input[name='sb_relay_id']:checked")[0].id;
        }
        if (radiochecked != '') {
            _write_point_relais_vlues(radiochecked);
        }
    };

    var _write_point_relais_vlues = function(item) {
        value = $("#" + item).val();
        relais_data = $.parseJSON(value);
        if(relais_data != null){
            infos = '{"relay_id":"' + relais_data.relay_id + '","shop_name":"' + relais_data.shop_name + '","address":"' + relais_data.address + '","postcode":"' + relais_data.postcode + '","city":"' + relais_data.city + '","type":"'+ relais_data.type_livraison +'"}';
            ajaxPointsRelais(true, item, infos);
        }
    };
    this.write_point_relais_vlues = function(item) {
        _write_point_relais_vlues(item);
    };
    var setCookie = function(cname, value) {
        var expire = new Date();
        expire.setDate(expire.getDate() + 1);
        document.cookie = cname + '=' + value + ';expires=' + expire.toGMTString();
    };
    var getCookie = function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
    this.popup_speedbox_view = function(id, mapid, lat, longti, baseurl) {
        $("#header").css('z-index', 0);
        $("#speedbox_relais_filter").fadeIn(150, function() {
            $("#" + id).fadeIn(150);
        });
        window.setTimeout(function() {
            init_google_maps(mapid, lat, longti, baseurl)
        }, 200);
    };
    var init_google_maps = function(mapid, lat, longti, baseurl) {
        var latlng = new google.maps.LatLng(lat, longti);
        var myOptions = {
            zoom: 16,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        var map = new google.maps.Map(document.getElementById(mapid), myOptions);
        var marker = new google.maps.Marker({
            icon: baseurl + "/modules/speedbox/views/img/front/logo-max-png.png",
            position: latlng,
            animation: google.maps.Animation.DROP,
            map: map
        });
    };
    this.hidePopup = function() {
        $('#sb_relais_filter').hide();
        $$('.sb_relaisbox').each(function(relaisbox) {
            $(relaisbox).hide();
        });
    };
    this.construct(ajaxurl, methodradioButton);
};
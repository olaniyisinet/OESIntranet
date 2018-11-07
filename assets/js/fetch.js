Fetch = {
    CONSTANTS: {
       
    },

    init: function () {
        Fetch.getFetch();
        Fetch.getCardStatus();
        Fetch.getCountries();
      
    },

    getFetch: function () {
        $.ajax({
           // url: App.api + '/' + Route.Fetch,
            url: App.api + Fetch.CONSTANTS.card_linking,
            data: {
                token: Cedezone.getToken()
            },
            error: function () {
                Cedezone.hideLoadingGif();
                Cedezone.showNotification('error', 'Error occurred while making connection', 'Error')
            },
            dataType: 'json',
            success: function (data) {
                Cedezone.hideLoadingGif();
                Fetch.populateFetch(data)
            },
            type: 'GET',
            beforeSend: function () {
                Cedezone.showLoadingGif();
            },
        });

    },

    getCountries: function () {
        $.ajax({
            url: 'http://localhost:55300/api/values',
            data: {
                format: 'json'
            },
            error: function () {
               alert(error);
            },
            dataType: 'json',
            success: function (data) {
                  console.log(data);
             //   Fetch.populateCountryDropdown(data);
            },
            type: 'GET'
        });
    },

    populateCountryDropdown: function (data) {
        var $country = $(".country_id");
        $country.empty();
        $country.append('<option value="">Select your country</option>')
        $.each(data, function (index, value) {
            //console.log(data)
            $country.append("<option value=" + value.id + ">" + value.name + "</option>");
        });
         if (Fetch.CONSTANTS.Fetch) {
            $country.val(Fetch.CONSTANTS.Fetch.data.country_id);
        }
    },

    getStatesInCountry: function (countryid) {
        $.ajax({
            url: App.api + '/country/states/' + countryid,
            data: {
                format: 'json'
            },
            error: function () {
                swal('Error', 'Error fetching avalable states in your country', 'error');
            },
            dataType: 'json',
            success: function (data) {
                // console.log(data);
                Fetch.populateStateDropdown(data);
            },
            type: 'GET'
        });
    },

    populateStateDropdown: function (data) {
        var $state = $(".state_id");
        $state.empty();
        $state.append('<option value="">Select your state</option>');
        $.each(data, function (index, value) {
            $state.append("<option value=" + value.id + ">" + value.name + "</option>");
        });
        if (Fetch.CONSTANTS.Fetch) {
            $state.val(Fetch.CONSTANTS.Fetch.data.state_id);
        }
    },

    getLocationsInState: function (stateid) {
        $.ajax({
            url: App.api + Fetch.CONSTANTS.location_route + stateid,
            data: {
                format: 'json'
            },
            error: function () {
                alert('Sorry error occured while fetching available locations in your state');
            },
            dataType: 'json',
            success: function (data) {
                Fetch.populateLocationDropdown(data);
            },
            type: 'GET'
        });
    },

    populateLocationDropdown: function (data) {
        var $location = $(".location_id");
        $location.empty();
        $location.append('<option value="">Select your Location</option>');
        $.each(data, function (index, value) {
            $location.append("<option value=" + value.id + ">" + value.name + "</option>");
        });
        if (Fetch.CONSTANTS.Fetch) {
            console.log(Fetch.CONSTANTS.Fetch.data.location_id);
            $location.val(Fetch.CONSTANTS.Fetch.data.location_id);
        }
    },

    ProcessError: function (data) {
        Cedezone.hideLoadingGif();
        console.log(data);
        var errorKeys = Object.keys(data.responseJSON);
        //    $('#login-error').append(Login.CONSTANTS.error);
//document.getElementById('login-error').innerHTML = 'Invalid Username or Password';
        //    Cedezone.showNotification('error', 'Wrong username or password', 'Invalid Login');
        errorKeys.forEach(function (record) {
            console.log(record);
            $('#' + record).addClass('parsley-error').parent().append(
                '<ul class="parsley-errors-list filled"><li class="parsley-required">' + data.responseJSON[record] + '</li></ul>'
            )
        });
    },
    /******ADDRESS MANAGEMENT SCRIPT***/
    getAddress: function(){
        $.ajax({
            url: App.api + Fetch.CONSTANTS.address_route,
            data: {
                format: 'json'
            },
            headers: {
                "Authorization": "Bearer " + Cedezone.getToken()
            },
            error: function () {
                swal('Error', 'Error fetching your address', 'error');
            },
            dataType: 'json',
            success: function (data) {
                //  console.log(data);
                Fetch.processGetAddress(data);
            },
            type: 'GET'
        });
    },
 processGetAddress: function(data)   {
     if($.isEmptyObject(data.data)){
         $('.address-holder').append($('#empty-address').html())
         return false;
     }
     var no = (data.pagination.current_page - 1) * data.pagination.per_page;
     $content =$('.address-template').html();
     $('.address-holder').html("");
     $('.address-holder').append($content);
     var responses=data.data;
     $.each(responses, function (i, item) {
         //for(no =1; no<=5; no++){
         no++
         $tr = $('<tr>').append(
             $('<td>').text(no),
             $('<td>').text(item.name),
             $('<td>').text(item.country.name+','+ item.state.name,', '+item.location.name),
             $('<td>').text(item.address),
             $('<td>').text(item.updated_at.date),
             $('<td>').html('<button class="btn btn-sm btn-info view" data-id="'+item.id+'" ' +
                 'data-state-id="'+item.state.id+'" data-country-id="'+item.country.id+'"  data-location-id="'+item.location.id+'">Edit</button>'
                 +'<button class="btn btn-sm btn-danger delete" data-id="'+item.id+'">Delete</button>'
             )
         )
         $('.address-holder table tbody').append($tr);
     })
 },

 saveNewAddress: function(data){
     $.ajax({
         url: App.api + Fetch.CONSTANTS.address_route,
         data: data,
         headers: {
             "Authorization": "Bearer " + Cedezone.getToken()
         },
         error: function () {
             swal('Error', 'Error saving your address', 'error');
         },
         dataType: 'json',
         success: function (data) {
             if(data.status==true){
                 swal('Success',data.msg,'success')
                  $('#myAddress').modal('toggle');
                 Fetch.getAddress();
                 return false;
             }
             swal('Error','Address could not be saved please review inputs','error');
         },
         type: 'POST'
     });
 }, 
    
 deleteAddress: function(id){
     $.ajax({
         url: App.api + Fetch.CONSTANTS.address_route + '/' + id,
         data: data,
         headers: {
             "Authorization": "Bearer " + Cedezone.getToken()
         },
         error: function () {
             swal('Error', 'Error saving your address', 'error');
         },
         dataType: 'json',
         success: function (data) {
             if(data.status==true){
                 swal('Success',data.msg,'success')
                  $('#myAddress').modal('toggle');
                 Fetch.getAddress();
                 return false;
             }
             swal('Error','Address could not be saved please review inputs','error');
         },
         type: 'POST'
     });
 },
    getCardStatus: function () {
        $.ajax({
            url: App.api + Fetch.CONSTANTS.card_linking,
            data: {
                token: Cedezone.getToken()
            },
            error: function () {
                Cedezone.hideLoadingGif();
                Cedezone.showNotification('error', 'Error occurred while making connection', 'Error')
            },
            dataType: 'json',
            success: function (data) {
               // Cedezone.hideLoadingGif();
                console.log(data);
               // providerFetch.populateFetch(data)
               // providerFetch.populateFetch(data)
            },
            type: 'GET',
//            beforeSend: function () {
//                Cedezone.showLoadingGif();
//            },
        });
    },

        getReferralCode: function(){
        $.ajax({
            url: App.api + Fetch.CONSTANTS.get_referral_code,
            data: {
//                format: 'json',
//                 token: Cedezone.getToken()
            },
            headers: {
                "Authorization": "Bearer " + Cedezone.getToken()
            },
            error: function () {
                swal('Error', 'Error fetching your referral code', 'error');
            },
            dataType: 'json',
            success: function (data) {
                console.log(data);
//                 alert(data.code);
//                Fetch.processGetAddress(data);
                        $('#FetchTab').find('#myreferralcode').text(data.code);
            },
            type: 'GET'
        });
    },
}

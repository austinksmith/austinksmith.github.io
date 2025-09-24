(function($) {
    "use strict";
    $(function(){

        /* 01: Prevent empty links to scroll
        ==============================================*/

        $('.header-menu a[href="#"]').on('click', function(event) {
            event.preventDefault();
        });

        
        /* 02: Sticky header
        ==============================================*/

        var mainHeader = $('.main-header');

        if(mainHeader.length) {
            var sticky = new Waypoint.Sticky({
                element: mainHeader[0],
                stuckClass: 'sticking',
                offset: -1
            });
        };

        /* 03: Sticky Header Animation
        ==============================================*/
        $(window).on("scroll", function () {
            if ($(".main-header").hasClass("sticking")) {
                $(".main-header").addClass("fadeInDown animated");
            } else {
                $(".main-header").removeClass("fadeInDown animated");
            }
        });

        /* 04: Parsley form validation
        ==============================================*/

        $('form').parsley();


        /* 05: Smooth scroll for scroll button
        ==============================================*/
        
        var $mainBanner = $('.genesis-1');
        
        $mainBanner.on('click', '.goDown', function(){
            var $target = $mainBanner.next();
            
            if ( $target.length ) {
                $('html, body').animate({
                    scrollTop: $target.offset().top - 50
                }, 500);
            }
        });


        /* 06: Smooth scroll for comment reply
        ==============================================*/
        
        var $commentContent = $('.comment-content > a');
        
        $commentContent.on('click', function(){
            var $target = $('.comment-form');
            
            if ( $target.length ) {
                $('html, body').animate({
                    scrollTop: $target.offset().top - 120
                }, 500);

                $target.find('textarea').focus();
            }
        });

        /* 07: Blog Hover
        ==============================================*/
        $(".single-post.post-style--2").on("mouseover", function(){
            $(this).find(".post-hover a").addClass("animated fadeInUp");
        });
        $(".single-post.post-style--2").on("mouseleave", function(){
            $(".post-hover a").removeClass("animated fadeInUp");
        });
        
        /* 08: Review slider
        ==============================================*/
        if(typeof Swiper !== 'undefined') {
            var swiperTeam = new Swiper('.review-slider', {
                slidesPerView: 3,
                spaceBetween: 30,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: true,
                },
                pagination: {
                    el: '.review-pagination',
                    clickable: true,
                },
                breakpoints: {
                    // when window width is <= 575px
                    575: {
                        slidesPerView: 1
                    },
                    // when window width is <=991px
                    991: {
                        slidesPerView: 2
                    }
                }
            });

            var swiperTeam = new Swiper('.review-slider--2', {
                slidesPerView: 1,
                loop: true,
                spaceBetween: 10,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: true,
                },
                navigation: {
                    prevEl: '.prev-review',
                    nextEl: '.next-review',
                }
            });

            var swiperTeam = new Swiper('.review-slider--3', {
                slidesPerView: 1,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: true,
                },
                navigation: {
                    prevEl: '.prev-review',
                    nextEl: '.next-review',
                }
            });
        }
        
        /* 09: Video popup
        ==============================================*/

        var $youtubePopup = $('.youtube-popup');

        if($youtubePopup.length) {

            $youtubePopup.magnificPopup({
                type:'iframe'
            });
        }

        
        /* 10: Back to top button
        ==============================================*/

        var $backToTopBtn = $('.back-to-top');

        if ($backToTopBtn.length) {
            var scrollTrigger = 400, // px
            backToTop = function () {
                var scrollTop = $(window).scrollTop();
                if (scrollTop > scrollTrigger) {
                    $backToTopBtn.addClass('show');
                } else {
                    $backToTopBtn.removeClass('show');
                }
            };

            backToTop();

            $(window).on('scroll', function () {
                backToTop();
            });

            $backToTopBtn.on('click', function (e) {
                e.preventDefault();
                $('html,body').animate({
                    scrollTop: 0
                }, 700);
            });
        }
        // Back to top button 2
        var amountScrolled = 650;
        var backBtn = $("a.back-top--2, a.back-top--3");
        $(window).on("scroll", function () {
            if ($(window).scrollTop() > amountScrolled) {
                backBtn.addClass("back-top-visible");
            } else {
                backBtn.removeClass("back-top-visible");
            }
        });
        backBtn.on("click", function () {
            $("html, body").animate({
                scrollTop: 0
            }, 700);
            return false;
        });


        /* 11: Counter
        ==============================================*/

        var happyCounter = $('.happy-counter li');

        if (happyCounter.length) {
            
            var a = 0;
            $(window).scroll(function() {

                var oTop = happyCounter.offset().top - window.innerHeight;
                if (a == 0 && $(window).scrollTop() > oTop) {

                    var $dataCount = $('[data-count]');

                    $dataCount.each(function() {
                        var $this = $(this),
                            countTo = $this.attr('data-count');
                        $({
                            countNum: $this.text()
                        }).animate({
                            countNum: countTo
                        },

                        {
                            duration: 2000,
                            easing: 'swing',
                            step: function() {
                                $this.text(Math.floor(this.countNum));
                            },
                            complete: function() {
                                $this.text(this.countNum);
                                //alert('finished');
                            }
                        });
                    });
                    a = 1;
                }
            }).scroll();
        }


        /* 13: Changing svg color
        ==============================================*/

        jQuery('img.svg').each(function(){
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');
        
            jQuery.get(imgURL, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');
        
                // Add replaced image's ID to the new SVG
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }
        
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');
                
                // Check if the viewport is set, else we gonna set it if we can.
                if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                    $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'));
                }
        
                // Replace image with new SVG
                $img.replaceWith($svg);
        
            }, 'xml');
        });
    });

    /* 15: Content animation
    ==============================================*/

    $(window).on('load', function() {

        var $animateEl = $('[data-animate]');

        $animateEl.each(function () {
            var $el = $(this),
                $name = $el.data('animate'),
                $duration = $el.data('duration'),
                $delay = $el.data('delay');

            $duration = typeof $duration === 'undefined' ? '0.6' : $duration ;
            $delay = typeof $delay === 'undefined' ? '0' : $delay ;

            $el.waypoint(function () {
                $el.addClass('animated ' + $name)
                   .css({
                        'animation-duration': $duration + 's',
                        'animation-delay': $delay + 's'
                   });
            }, {offset: '93%'});
        });
    });
    

    /* 16: Background image
    ==============================================*/

    var bgImg = $('[data-bg-img]');

    bgImg.css('background-image', function(){
        return 'url(' + $(this).data('bg-img') + ')';
    });

    /* 17: Mega Menu
    ==============================================*/
    if ($(window).width() <= 991) {
        $(".mega-menu").prependTo('.mega-drop-down > ul > li');
    };


    /*==================================
    19: Ajax Subscribe Form 
    ====================================*/

    $('.subscribe-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        // lzwFlossRedux.encode($el.serialize()).then(function(encodedInput) {
            $.post($el.attr('action'), $el.serialize(), function(response) {
               $('.subscribe-form-response').html('<span>' + response.result + '</span>');
            });
        // });
    });

    /*==================================
    20: Ajax Search Form 
    ====================================*/

    $('.search-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        $('.search-form-response').html('<span>' + "wow" + '</span>');
    });

    /*==================================
    21: Ajax Contact Form 
    ====================================*/

    $('.contact-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        $.post($el.attr('action'), $el.serialize(), function(response) {
            $('.contact-form-response').html('<span>' + response.result + '</span>');
        });
    });

    /*==================================
    22: Ajax Profile Form 
    ====================================*/

    $('.profile-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.save-profile').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                $('.loading-icon').hide();
                $('.profile-form-response').html('<span>' + response.result + '</span>');
                $('.save-profile').show();
            });
        }, 300);
    });

    /*==================================
    22: Ajax Profile Form 
    ====================================*/

    $('.billing-preferences-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.save-billing').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                $('.loading-icon').hide();
                $('.billing-preferences-form-response').html('<span>' + response.result + '</span>');
                $('.save-billing').show();
            });
        }, 300);
    });

    /*==================================
    23: Login Form 
    ====================================*/

    $('.login-form form').on('submit', function(e) {
    e.preventDefault();
    var $el = $(this);
    var formResult = $el.attr('action');
    $('.login-account').hide();
    $('.loading-icon').show();
    setTimeout(function() {
        $.ajax({
            type: 'POST',
            url: formResult,
            data: $el.serialize(),
            success: function(response) {
                $('.loading-icon').hide();
                if (typeof response.result === 'string') {
                    $('.login-form-response').html('<span>' + response.result + '</span>');
                    $('.login-account').show();
                } else {
                    window.location.href = window.location.origin + '/burrow';
                }
            },
            error: function(xhr, status, error) {
                $('.loading-icon').hide();
                if (xhr.status === 400 || xhr.status === 500) {
                    $('.login-form-response').html('<span>An error occurred: ' + xhr.statusText + '</span>');
                } else {
                    window.location.reload();
                }
            }
        });
    }, 300);
});

    /*==================================
    24: Create Support Request Form 
    ====================================*/

    $('.create-request-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.create-request').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                var result = response.result;
                $('.loading-icon').hide();
                $('.create-request-form-response').html('<span>' + result + '</span>');
                if(result.indexOf('Thank you') === -1) {
                    $('.create-request').show();
                }
            });
        }, 300);
    });

    /*==================================
    25: Update Support Request Form 
    ====================================*/

    $('.update-request-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.update-request').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                var result = response.result;
                $('.loading-icon').hide();
                if(result.indexOf('Thank you') !== -1) {
                    $('.update-request').show();
                } else {
                    window.location.reload();
                }
            });
        }, 300);
    });

    /*==================================
    26: Registration Form 
    ====================================*/

    $('.registration-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.create-account').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                var result = response.result;
                $('.loading-icon').hide();
                if(result !== 'Your account has been created!') {
                    $('.create-account').show();
                } else {
                    result += ' Proceed to <a href="/login">Login</a>';
                }
                $('.registration-form-response').html('<span>' + result + '</span>');
            });
        }, 300);
    });

    /*==================================
    27: Create Application Form 
    ====================================*/

    $('.create-application-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.create-request').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                var result = response.result;
                $('.loading-icon').hide();
                $('.application-form-response').html('<span>' + result + '</span>');
                if(result.indexOf('Thank you') === -1) {
                    $('.create-request').show();
                }
            });
        }, 300);
    });

    /*==================================
    28: Update Application Form 
    ====================================*/

    $('.update-application-form form').on('submit', function(e) {
        e.preventDefault();
        var $el = $(this);
        var formResult = $el.attr('action');
        $('.create-request').hide();
        $('.loading-icon').show();
        setTimeout(function() {
            $.post(formResult, $el.serialize(), function(response) {
                var result = response.result;
                $('.loading-icon').hide();
                $('.create-request-form-response').html('<span>' + result + '</span>');
                if(result.indexOf('Thank you') === -1) {
                    $('.create-request').show();
                }
            });
        }, 300);
    });

    // Populate time zone select drop down
    var timeZoneSelect = $("#timeZone");
    if(typeof timeZoneSelect !== 'undefined') {
        var timeZones = moment.tz.names();
        for(var i = 0; i < timeZones.length; i++) {
          timeZoneSelect.append(new Option(timeZones[i], timeZones[i]));
        }
    }
    //Ensure drop down reflect user saved preference
    timeZoneSelect.val(timeZoneSelect.attr('value')).change();


    // Populate application type select drop down
    var applicationPlanSelect = $("#applicationPlanSelect");
    if(typeof applicationPlanSelect !== 'undefined') {
        var planLevels = [
            'Free',
            'Bronze',
            'Silver',
            'Gold',
            'Platinum'

        ];
        for(var i = 0; i < planLevels.length; i++) {
          applicationPlanSelect.append(new Option(planLevels[i], planLevels[i]));
        }
    }
    //Ensure drop down reflect user saved preference
    applicationPlanSelect.val(applicationPlanSelect.attr('value')).change();


    // Populate country select drop down
    // var countrySelect = $("#Country");
    // if(typeof countrySelect !== 'undefined') {
    //     $.get("/countries", function(response) {
    //         var countries = response.result;
    //         for(var i = 0; i < countries.length; i++) {
    //           countrySelect.append(new Option(countries[i], countries[i]));
    //         }
    //         countrySelect.val(countrySelect.attr('value')).change();
    //         $('.loading-icon').hide();
    //     });
    // }

    // var boolSelect = $("#applicationEnabled");
    // if(typeof boolSelect !== 'undefined') {
    //     $.get("/boolOptions", function(response) {
    //         var options = response.result;
    //         for(var i = 0; i < options.length; i++) {
    //           boolSelect.append(new Option(options[i], options[i]));
    //         }
    //         boolSelect.val(boolSelect.attr('value')).change();
    //         $('.loading-icon').hide();
    //     });
    // }

    let context = new AudioContext();
    let source = null;
    let aacBuffer = null;

    function playSound(buffer) {
        if (source) {
            source.stop(); // stop any existing source
        }
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
    }

    function loadAACSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                aacBuffer = buffer;
                playSound(buffer);
            }, onError);
        };
        request.send();
    }

    function onError(error) {
        console.log(`There was an error processing the audio ${error}`);
    }

    $('#play-audio-button').on('click', () => {
        loadAACSound('https://d1y4cgbbgfua7m.cloudfront.net/audio/Audio+Terrorism.m4a'); // Assuming it's actually AAC, not WMV
    });

    $('#play-audio-button-iu').on('click', () => {
        loadAACSound('airdrop/IU.m4a'); // Assuming it's actually AAC, not WMV
    });

    $('#play-audio-button-additional').on('click', () => {
        loadAACSound('airdrop/sherrifs_office.m4a'); // Assuming it's actually AAC, not WMV
    });

    $('#play-audio-button-threateningachild').on('click', () => {
        loadAACSound('airdrop/clip_0004.aac'); // Assuming it's actually AAC, not WMV
    });

    $('#stop-audio-button-threateningachild').on('click', () => {
        if (source) {
            source.stop();
            source = null;
        }
    });

    $('#stop-audio-button-additional').on('click', () => {
        if (source) {
            source.stop();
            source = null;
        }
    });

    $('#stop-audio-button').on('click', () => {
        if (source) {
            source.stop();
            source = null;
        }
    });

    $('#stop-audio-button-iu').on('click', () => {
        if (source) {
            source.stop();
            source = null;
        }
    });



    // //GoalLoad
    // var title = "Total Donations";
    // var offlineDonations = 0;
    // var currentDonations = 25 + offlineDonations;
    // var currentGoal = 50000;
    // var percentageAchieved = (currentDonations / currentGoal) * 100;

    // $('.goal-cont__title').html(title);
    // $('.goal-bar__current').text(currentDonations);
    // // $('.goal-bar__total').text(currentGoal);
    // $('.goal-cont__progress').css({width: percentageAchieved + "%"});

    // //GoalEvent
    // $('.goal-bar__current').text(currentDonations);


    //Initialize Hamsters.js
    if(document.URL.indexOf("examples") !== -1) {
        hamsters.init();
    }
})(jQuery);
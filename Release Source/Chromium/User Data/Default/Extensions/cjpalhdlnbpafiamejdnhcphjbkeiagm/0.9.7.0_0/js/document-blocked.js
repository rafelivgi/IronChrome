/*******************************************************************************

    uBlock - a browser extension to block requests.
    Copyright (C) 2015 Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

/* global uDom */

/******************************************************************************/

(function() {

'use strict';

/******************************************************************************/

var messager = vAPI.messaging.channel('document-blocked.js');
var details = {};

(function() {
    var matches = /details=([^&]+)/.exec(window.location.search);
    if ( matches === null ) {
        return;
    }
    details = JSON.parse(atob(matches[1]));
})();

/******************************************************************************/

var getTargetHostname = function() {
    var hostname = details.hn;
    var elem = document.querySelector('#proceed select');
    if ( elem !== null ) {
        hostname = elem.value;
    }
    return hostname;
};

/******************************************************************************/

var proceedToURL = function() {
    window.location.replace(details.url);
};

/******************************************************************************/

var proceedTemporary = function() {
    messager.send({
        what: 'temporarilyWhitelistDocument',
        hostname: getTargetHostname()
    }, proceedToURL);
};

/******************************************************************************/

var proceedPermanent = function() {
    messager.send({
        what: 'toggleHostnameSwitch',
        name: 'no-strict-blocking',
        hostname: getTargetHostname(),
        deep: true,
        state: true
    }, proceedToURL);
};

/******************************************************************************/

(function() {
    var matches = /^(.*)\{\{hostname\}\}(.*)$/.exec(vAPI.i18n('docblockedProceed'));
    if ( matches === null ) {
        return;
    }
    var proceed = uDom('#proceedTemplate').clone();
    proceed.descendants('span:nth-of-type(1)').text(matches[1]);
    proceed.descendants('span:nth-of-type(4)').text(matches[2]);

    if ( details.hn === details.dn ) {
        proceed.descendants('span:nth-of-type(2)').remove();
        proceed.descendants('.hn').text(details.hn);
    } else {
        proceed.descendants('span:nth-of-type(3)').remove();
        proceed.descendants('.hn').text(details.hn).attr('value', details.hn);
        proceed.descendants('.dn').text(details.dn).attr('value', details.dn);
    }

    uDom('#proceed').append(proceed);
})();

/******************************************************************************/

uDom('.what').text(details.url);
uDom('#why').text(details.why.slice(3));

if ( window.history.length > 1 ) {
    uDom('#back').on('click', function() { window.history.back(); });
    uDom('#bye').css('display', 'none');
} else {
    uDom('#bye').on('click', function() { window.close(); });
    uDom('#back').css('display', 'none');
}

uDom('#proceedTemporary').attr('href', details.url).on('click', proceedTemporary);
uDom('#proceedPermanent').attr('href', details.url).on('click', proceedPermanent);

/******************************************************************************/

})();

/******************************************************************************/

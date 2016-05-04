import Parser from 'react-dom-parser';
import dom from './utils/dom';
import Input from './classes/input';
import Player from './classes/player';
import Controls from './classes/controls';
import Room from './classes/room';
import Playlists from './classes/Playlists';
import QueueList from './classes/queueList';
import AvatarUpload from './classes/avatarUpload';
import RoomList from './classes/roomList';
import CreateRoom from './classes/createRoom';
import MyRooms from './classes/myRooms';

Parser.register({Input, Player, Controls, Room, Playlists, QueueList, AvatarUpload, RoomList, CreateRoom, MyRooms});

Parser.parse(dom.$body[0]);

$('form').submit((e) => {
	var $inputs = $(e.target).find('[data-reactid]'),
		isValid = true,
		$firstInvalid;
	$.each($inputs, function(){
		var component = Parser.getByNode(this);
		if(component && component.validate && !component.validate()){
			isValid = false;
			if(!$firstInvalid) $firstInvalid = $(this);
		}
	});
	if(!isValid){
		e.preventDefault();
		$('html,body').animate({
			scrollTop: $firstInvalid.offset().top
		});
	}
});

$('#open-sidebar-nav').click((e) => {
	e.preventDefault();
	dom.$body.toggleClass('sidebar-nav-open');
});

$('#page-overlay-shadow, #close-sidebar-nav').click((e) => {
	e.preventDefault();
	dom.$body.removeClass('sidebar-nav-open');
});

$('#lobby_search').keyup((e) => {
	let value = e.target.value,
		list = Parser.getByNode(document.getElementById('room-list'));
	list.filter(value);
});
import React from 'react';
import Input from './input';

class CreateRoom extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			formOpen: false,
			invalid: false
		};
	}

	openForm() {
		this.setState({formOpen: true});
	}

	createRoom(e) {
		e.preventDefault();
		let values = {},
			invalid;
		[this.refs.name, this.refs.description, this.refs.genre, this.refs.capacity].forEach(input => {
			if(!input.validate()) {
				invalid = true;
			} else {
				values[input.props.attributes.name] = input.state.value;
			}
		});
		if(invalid) {
			this.setState({invalid: true});
		} else {
			$.ajax({
				url: '/rooms',
				method: 'POST',
				data: values,
				success: (response) => {
					console.log(response);
				},
				error: (err) => {
					console.log(err);
				}
			});
		}
	}

	render(){
		if(this.state.formOpen) {
			return (
				<form onSubmit={this.createRoom.bind(this)}>
					<Input required={true} ref="name" attributes={{
						name: 'name',
						id: 'name_input',
						placeholder: 'Room name'
					}}/>
					<Input required={true} ref="description" attributes={{
						name: 'description',
						id: 'description_input',
						placeholder: 'Room description'
					}}/>
					<Input required={true} ref="genre" tag="select" attributes={{
						name: 'genre',
						id: 'genre_input',
						placeholder: 'Select a genre'
					}} options={[
						{
							label: 'Assorted',
							value: 'assorted'	
						},
						{
							label: 'Rap/Hip-Hop',
							value: 'rap'	
						},
						{
							label: 'Rock/Metal',
							value: 'rock'	
						},
						{
							label: 'Blues/Country',
							value: 'blues'	
						},
						{
							label: 'Jazz/Soul',
							value: 'jazz'	
						},
						{
							label: 'Electro/Dance',
							value: 'electro'	
						},
						{
							label: 'Acoustic/Indie Rock',
							value: 'acoustic'	
						}
					]}/>
					<Input required={true} ref="capacity" tag="select" attributes={{
						name: 'capacity',
						id: 'capacity_input',
						placeholder: 'Room capacity'
					}} options={[
						{
							label: '10',
							value: '10'	
						},
						{
							label: '50',
							value: '50'	
						},
						{
							label: '100',
							value: '100',
							disabled: true
						},
						{
							label: 'unlimited',
							value: 'unlimited',
							disabled: true
						}
					]}/>
					<button type="submit" className="btn">Save</button>
				</form>
			);
		} else {
			return (
				<button className="btn" type="button" onClick={this.openForm.bind(this)}>Create room</button>
			);
		}

	}
}

CreateRoom.defaultProps = {};

export default CreateRoom;
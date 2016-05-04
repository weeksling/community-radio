import ReactDOM from 'react-dom';
import React from 'react';

class Input extends React.Component {

	constructor(props) {

		super(props);

		this.isOldie = false;
		this.mounted = false;

		this.state = {
			value: '',
			valid: true
		};

		if(this.props.attributes.autoComplete == 'off' && (!this.props.attributes.value || this.props.attributes.value == '')) {
			setTimeout(() => {
				this.setState({
					value: '',
					valid: true
				});
			}, 200);
		}

		if(this.props.confirmational) {
			this.relationalInput = document.getElementById(this.props.confirmational);
		}

	}

	componentWillReceiveProps(props){
		this.setState({value: props.attributes.value});
	}

	componentWillMount(){
		var domClass =  document.documentElement.className;
		this.isOldie = (domClass.indexOf('ie9') > -1 || domClass.indexOf('ie8') > -1 || domClass.indexOf('ie6') > -1 || domClass.indexOf('ie7') > -1);
		this.setState({value: this.props.attributes.value});
	}

	componentDidMount(){
		this.mounted = true;
		if(this.props.parameter){
			var parameters = {};
			$.each(location.search.substr(1).split("&"), function(index, part){
			    var item = part.split("="),
			        result = {};
			    parameters[item[0]] = decodeURIComponent(item[1]);
			});
			if(parameters[this.props.parameter]){
				this.setState({value: parameters[this.props.parameter]});
			}
		}
		if(this.isOldie && this.props.attributes.placeholder && this.props.attributes.type == 'text'){
			this.setState({value: this.props.attributes.placeholder});
		}
	}

	validate(newValue){
		var value = typeof(newValue) !== 'undefined' ? newValue : (this.state.value ? this.state.value : ''),
			isValid = true;
		if(this.props.validation){
			if(this.props.validation instanceof RegExp){
				isValid = this.props.validation.test(value);
			} else {
				isValid = new RegExp(this.props.validation).test(value);
			}
		}
		if(!isValid && !this.props.required && value.length === 0){
			isValid = true;
		} else if(this.props.required && this.props.attributes.type == 'checkbox' && !ReactDOM.findDOMNode(this.refs['form-element']).checked){ 
			isValid = false;
		} else if(this.props.required && value.length === 0){
			isValid = false;
		}
		if(this.props.confirmational && this.relationalInput) {
			if(this.relationalInput.value !== value) {
				isValid = false;
			}
		}
		this.setState({valid: isValid});
		return isValid;
	}

	handleChange(event){
		if(this.props.tag == 'select') $(ReactDOM.findDOMNode(this.refs['form-element'])).blur();
		this.setState({value: event.target.value});
		if(this.props.onChange) {
			this.props.onChange(event);
		}
	}

	handleFocus(event){
		if(this.state.value == this.props.attributes.placeholder){
			this.setState({value: ''});
		}
	}

	handleBlur(event){
		this.validate(event.target.value);
		if(!this.isOldie || !this.props.attributes.placeholder || this.props.attributes.type != 'text') return;
		if(this.state.value == ''){
			this.setState({value: this.props.attributes.placeholder});
		}
	}

	render(){
		var self = this;
		if(this.props.attributes.type == 'radio'){
			this.props.attributes.className += ' input-wrapper';
			return (
				<fieldset className={this.state.valid ? this.props.attributes.className : this.props.attributes.className+' error'} >
						<legend>{this.props.legend}</legend>
						<p className="small-margin">{this.props.description}</p>
						{this.props.options.map(_.bind(function(option, i) {
							return <label htmlFor={'radio-button-'+i+'-'+this.props.attributes.name}><input autoComplete={this.props.attributes.autoComplete} id={'radio-button-'+i+'-'+this.props.attributes.name} key={'input-option-'+i} type={this.props.attributes.type} name={this.props.attributes.name} value={option.value} onChange={this.handleChange.bind(this)} onFocus={this.handleFocus.bind(this)} onBlur={this.handleBlur.bind(this)} />{option.label}</label>
						}, this))}
						{(function(){
							if(!self.state.valid){
								return <span className="error-msg">{self.props.errorMsg}</span>
							}
						})()}
				</fieldset>
			);
		} else if(this.props.tag == 'select'){
			return (
				<div className="input-wrapper">
					<select ref="form-element" {...this.props.attributes} autoComplete={this.props.attributes.autoComplete} onChange={this.handleChange.bind(this)} onFocus={this.handleFocus.bind(this)} onBlur={this.handleBlur.bind(this)} className={this.state.valid ? this.props.attributes.className : this.props.attributes.className+' error'} >
						<option disabled selected>{this.props.attributes.placeholder}</option>
						{this.props.options.map(_.bind(function(option, i) {
							return <option key={'input-option-'+i} value={option.value} disabled={option.disabled}>{option.label}</option>
						}, this))}
					</select>
					{(function(){
						if(!self.state.valid){
							return <span className="error-msg">{self.props.errorMsg}</span>
						}
					})()}
				</div>
			)
		} else {
			return (
				<div className="input-wrapper">
					<this.props.tag ref="form-element" {...this.props.attributes} autoComplete={this.props.attributes.autoComplete} onChange={this.handleChange.bind(this)} value={this.state.value} onFocus={this.handleFocus.bind(this)} onBlur={this.handleBlur.bind(this)} className={this.state.valid ? this.props.attributes.className : this.props.attributes.className+' error'} />
						{(function(){
							if(!self.state.valid){
								return <span className="error-msg animated bounceIn">{self.props.errorMsg}</span>
							}
						})()}
				</div>
			);
		}
	}
}

Input.defaultProps = {
	tag: 'input',
	confirmational: null,
	attributes: {
		type: 'text',
		placeholder: null,
		name: 'input',
		id: 'input',
		className: '',
		autoComplete: 'true'
	},
	validation: null,
	parameter: null,
	errorMsg: 'This field is invalid',
	required: false
};

Input.propTypes = {
	tag: React.PropTypes.string,
	attributes: React.PropTypes.shape({
		type: React.PropTypes.string,
		placeholder: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.bool
		]),
		name: React.PropTypes.string,
		id: React.PropTypes.string,
		autoComplete: React.PropTypes.string
	}),
	confirmational: React.PropTypes.string,
	parameter: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.bool
	]),
	errorMsg: React.PropTypes.string,
	required: React.PropTypes.bool
};

export default Input;
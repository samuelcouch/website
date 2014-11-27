/** @jsx React.DOM */
var React       = require('react');

var AuthService = require('../../services/auth'),
    Actions     = require('../../actions');

var Register = React.createClass({
    getInitialState: function() {
        return {
            toastMessage: undefined,
            templeEmailAddress: '',
            userName: '',
            password: '',
            confPass: '',
            waiting: false
        };
    },
    componentDidMount: function() {
        Actions.changePageTitle('Register');
    },
    onUserNameUpdated: function(event) {
        this.setState({
            userName: event.target.value
        });
    },
    onTempleEmailUpdated: function(){
        this.setState({
            templeEmailAddress: event.target.value
        });
    },
    onPasswordUpdated: function(event){
        this.setState({
            password: event.target.value
        });
    },
    onConfPasswordUpdated: function(event){
        this.setState({
            confPass: event.target.value
        });
        this.comparePasswords();
    },
    comparePasswords: function(event){
        if(this.state.toastMessage){
            if(this.state.password === this.state.confPass){
                this.setState({
                    toastMessage: ''
                });
            }
        }
        else{
            if(!(this.state.password === this.state.confPass)){
                this.setState({
                        toastMessage: 'Make sure you enter the same password :)'
                });
            }
        }
    },
    onEnterPressed: function(event){
        if(event.keyCode === 13){
            this.attemptRegistration();
        }
    },
    onSubmitClicked: function() {
        this.attemptRegistration();
    },
    attemptRegistration: function(event){
        if(this.state.waiting)
            return;
        else{
            if (this.state.userName.trim() === '' || this.state.templeEmailAddress.trim() === '') {
                this.setState({
                    toastMessage: 'Those aren\'t real credentials. Don\'t be silly.'
                });
                return;
            }
            this.setState({
                waiting: true,
                toastMessage: undefined
            });
            var component = this;
            AuthService.register(this.state.userName, this.state.templeEmailAddress, this.state.password, function(err, res){
                if (err) {
                    // The was an issue with the connection
                    component.setState({
                        waiting: false,
                        password: '',
                        toastMessage:
                            'There was a problem connecting to the server. ' +
                            'Check your connection status and try again.'
                    });
                }
                else{
                    if (res.status === 409) {
                        // Bad credentials
                        component.setState({
                            waiting: false,
                            password: '',
                            toastMessage: 'Looks like there\'s already a user with those credentials... Imposter?'
                        }, function() {
                            // Focus and clear the password box
                            component.refs.password.getDOMNode().focus();
                        });
                        return;
                    }
                    else if (res.status === 200) {
                        alert('Registration successful. Try and login.');
                    }
                    else{
                        component.setState({
                            waiting: false,
                            toastMessage:
                                'There was internal problem with the server. ' +
                                'If you don\'t mind, shoot us an email at if this keeps happening.'
                        });
                    }
                }
            })
        }
    },
    render: function() {
        return (
            <div id="register">
            	<div className="card">
            		<div className="wrapper">
            			<h1>
                            <span className={this.state.waiting ? 'hidden' : ''}>Registration</span>
                            <i className={'fa fa-refresh fa-spin' + (this.state.waiting ? '' : ' hidden')}></i>
                        </h1>
                        <div className="divider"/>
                        <div className="form">
                            <div className="label">User Name</div>
                            <input type="text" className="textbox" ref="username" id="username-textbox" value={this.state.userName} onChange={this.onUserNameUpdated} disabled={this.state.waiting}/>
                            
                            <div className="label">Temple Email</div>
                            <input type="text" className="textbox" ref="tuemail" id="tuemail-textbox" value={this.state.templeEmailAddress} onChange={this.onTempleEmailUpdated} disabled={this.state.waiting}/>
                            
                            <div className="label">Password</div>
                            <input type="password" className="textbox" ref="password" id="password-textbox" value={this.state.password} onChange={this.onPasswordUpdated} disabled={this.state.waiting}/>
                            <div className="label">Confirm Password</div>
                            <input type="password" className="textbox" ref="password" id="confpassword-textbox" value={this.state.confPassword} onChange={this.onConfPasswordUpdated} onKeyDown={this.onEnterPressed} disabled={this.state.waiting}/>
                        
                        </div>
                        <div className={'flash' + (this.state.toastMessage ? ' visible' : '')}>
                            {this.state.toastMessage}
                        </div>
                        <button id="submit-button" onClick={this.onSubmitClicked} disabled={this.state.waiting}>Register</button>
            		</div>
            	</div>
            </div>
        );
    }
});

module.exports = Register;
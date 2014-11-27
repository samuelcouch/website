/** @jsx React.DOM */
var React       = require('react');

var AuthService = require('../../services/auth'),
    Actions     = require('../../actions');

var Login = React.createClass({
    getInitialState: function() {
        return {
            toastMessage: undefined,
            userName: '',
            password: '',
            waiting: false
        };
    },
    componentDidMount: function() {
        Actions.changePageTitle('Log In');
    },
    onUserNameUpdated: function(event) {
        this.setState({
            userName: event.target.value
        });
    },
    onPasswordUpdated: function(event) {
        this.setState({
            password: event.target.value
        });
    },
    onSubmitClicked: function() {
        this.attemptLogin();
    },
    onPasswordKeyPress: function(event) {
        if (event.keyCode === 13) {
            // Enter was pressed - submit the form
            this.attemptLogin();
        }
    },
    attemptLogin: function() {
        if (this.state.waiting) return;
        else {
            if (this.state.userName.trim() === '') {
                this.setState({
                    toastMessage: 'Those aren\'t real credentials. Don\'t be silly.'
                });
                return;
            }
            // Start waiting
            this.setState({
                waiting: true,
                toastMessage: undefined
            });
            // Send the login request
            var component = this;
            AuthService.login(this.state.userName, this.state.password, function(err, res) {
                if (err) {
                    // The was an issue with the connection
                    component.setState({
                        waiting: false,
                        password: '',
                        toastMessage:
                            'There was a problem connecting to the server. ' +
                            'Check your connection status and try again.'
                    });
                } else {
                    if (res.status === 401) {
                        // Bad credentials
                        component.setState({
                            waiting: false,
                            password: '',
                            toastMessage: 'The credentials you provided were invalid. Feel free to try again.'
                        }, function() {
                            // Focus and clear the password box
                            component.refs.password.getDOMNode().focus();
                        });
                        return;
                    } else if (res.status === 200) {
                        // TODO
                        alert('Authentication successful. TODO do something real here.');
                    } else {
                        // Stop waiting
                        component.setState({
                            waiting: false,
                            toastMessage:
                                'There was internal problem with the server. ' +
                                'If you don\'t mind, shoot us an email at if this keeps happening.'
                        });
                    }
                }
            });
        }
    },
    render: function() {
        return (
            <div id="login">
                <div className="card">
                    <div className="wrapper">
                        <h1>
                            <span className={this.state.waiting ? 'hidden' : ''}>Log In</span>
                            <i className={'fa fa-refresh fa-spin' + (this.state.waiting ? '' : ' hidden')}></i>
                        </h1>
                        <div className="divider"/>
                        <div className="form">
                            <div className="label">User Name</div>
                            <input type="text" className="textbox" ref="username" id="username-textbox" value={this.state.userName} onChange={this.onUserNameUpdated} disabled={this.state.waiting}/>
                            <div className="label">Password</div>
                            <input type="password" className="textbox" ref="password" id="password-textbox" value={this.state.password} onChange={this.onPasswordUpdated} onKeyDown={this.onPasswordKeyPress} disabled={this.state.waiting}/>
                        </div>
                        <div className={'flash' + (this.state.toastMessage ? ' visible' : '')}>
                            {this.state.toastMessage}
                        </div>
                        <p>If you have forgotten your password, click <span className="link">this link</span>.</p>
                        <div className="divider"/>
                        <button id="login-button" onClick={this.onSubmitClicked} disabled={this.state.waiting}>Log In</button>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Login;
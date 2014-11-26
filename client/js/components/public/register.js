/** @jsx React.DOM */
var React       = require('react');

var Actions     = require('../../actions');

var Register = React.createClass({
    componentDidMount: function() {
        Actions.changePageTitle('Register');
    },
    render: function() {
        return (
            <div id="register">
            	<div className="card">
            		<div className="wrapper">
            			<span>Register</span>
            		</div>
            	</div>
            </div>
        );
    }
});

module.exports = Register;
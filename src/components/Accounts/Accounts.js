import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getUserInfo } from '../../reducers/users';
import './Accounts.css';

class Accounts extends Component {
    componentDidMount() {
        this.props.getUserInfo();
    }
    render() {
        console.log(this.props.user)
        const { data } = this.props.user;
        const loginJSX = (
            data ?
            <div className='info-container'>
                <h1> Community Bank</h1><hr />
                <h4> Account Info: </h4>
                <img className='avatar' scr={data.img} />
                <p> username: {data.username} </p>
                <p> email: {data.email} </p>
            </div>
            :
            <div className='info-container'>
                <h1> Community Bank</h1>
                <h4> Please log in to view bank information.</h4>
                <Link to='/'><button>Log In</button></Link>
            </div>
        )
        return (
            <div>
                { loginJSX }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

export default connect( mapStateToProps, { getUserInfo })(Accounts);


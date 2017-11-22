import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getUserInfo, updateBalance } from '../../reducers/users';
import './Accounts.css';

class Accounts extends Component {
    componentDidMount() {
        this.props.getUserInfo();
    }

    deposit = (amount, id) => {
      axios.post(`http://localhost:3005/user/balance?Action=deposit&amount=100&currentAmount=${amount}&userId=${id}`).then(balance => {
        console.log('balance', balance)
        let updatedBalance = balance.data[0].balance
        this.props.updateBalance(updatedBalance)
      })
      //This will make a request to the backend and deposit an amount, then get back updated amount
    }
    withdraw = (amount, id) => {
      axios.post(`http://localhost:3005/user/balance?Action=withdraw&amount=100&currentAmount=${amount}&userId=${id}`).then(balance => {
        if(balance.data === 'Balance is too low') {
          alert('Balance is too low');
        }
        else {
          let updatedBalance = balance.data[0].balance
          this.props.updateBalance(updatedBalance)
        }
      })
      //This will make a request to the backend and withdraw an amount, then get back updated amount
    }
    render() {
        const { data } = this.props.user;
        const loginJSX = (
            data ?
            <div className='info-container'>
                <h1> Community Bank</h1><hr />
                <h4> Account Info: </h4>
                <img className='avatar' scr={data.img} />
                <p> username: {data.username} </p>
                <p> email: {data.email} </p>
                <p> balance: {data.balance} </p>
                <button onClick={() => {
                    this.deposit(data.balance, data.id)
                    }}>Deposit $100</button>
                  <button onClick={() => {
                      this.withdraw(data.balance, data.id)
                    }}>Withdraw $100</button>
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
  console.log(state)

    return {
        user: state.users
    }
}

export default connect( mapStateToProps, { getUserInfo, updateBalance })(Accounts);

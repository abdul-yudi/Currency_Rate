import React from "react";
import ReactDOM from "react-dom";

// jQuery
import $ from "jquery";

import "./styles.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      currency: {},
      baseCurrency: null,
      activeCurrency: ["SGD", "IDR", "AUD"],
      detailCurrency: [],
      calcCurrency: 1,
      selectedValue: "0",
      editInput: false
    };

    this.selectChange = this.selectChange.bind(this);
    this.selectHover = this.selectHover.bind(this);
    this.editCalcRate = this.editCalcRate.bind(this);
    this.removeCurrency = this.removeCurrency.bind(this);
    this.activeCurrency = this.activeCurrency.bind(this);
    this.addCurrency = this.addCurrency.bind(this);
    this.calcCurrency = this.calcCurrency.bind(this);
  }

  componentDidMount() {
    var Api = "https://api.exchangeratesapi.io/latest?base=USD";
    fetch(Api)
      .then(res => res.json())
      .then(currency => {
        this.setState(
          {
            currency: currency.rates,
            baseCurrency: currency.base
          },
          () => ((this.rates = this.state.currency), this.activeCurrency())
        );
      })
      .catch(error => console.log(error));
  }

  // EVENT HANDLER
  selectChange(e) {
    var thisValue = e.target.value;
    this.setState({
      selectedValue: thisValue
    });
  }

  selectHover() {
    this.selectChange;
  }

  editCalcRate() {
    var rates = this.rates;
    var rateVal = this.state.calcCurrency;
    this.setState({
      editInput: true
    });

    for (var key in rates) {
      rates[key] = rates[key] / rateVal;
    }
  }

  // OPTION INPUT SELECT
  listRates() {
    var rates = this.rates;
    var out = "";
    for (var key in rates) {
      out += "<option value=" + key + ">" + key + "</option>";
    }
    $(".select-currency").html(
      "<option value='0' disabled selected>Add currency</option>" +
        out.replace(/\\n/g, "")
    );
  }

  // ACTIVE
  activeCurrency() {
    var rates = this.rates;
    var actCurrency = this.state.activeCurrency;
    this.setState({
      detailCurrency: actCurrency.map(name => ({
        nameCurrency: name,
        rateCurrency: rates[name]
      }))
    });
  }

  // ADD
  addCurrency() {
    var detailCurrency = this.rates.detailCurrency;
    var nameCurrency = this.state.selectedValue;
    var actCurrency = this.state.activeCurrency;
    if ($(".select-currency option:selected").val() != "0") {
      // Object.keys(detailCurrency)[key] == nameCurrency)
      this.setState(
        {
          activeCurrency: [...this.state.activeCurrency, nameCurrency]
        },
        () => this.activeCurrency()
      );
      $(".card-body").animate(
        {
          scrollTop: $(".card-body")[0].scrollHeight
        },
        "slow"
      );
      // console.log(Object.keys(detailCurrency)[key] + " = ", nameCurrency);
    } else {
      alert("Please select another / that already in the list ");
    }
  }

  // REMOVE
  removeCurrency(item, index) {
    var actCurrency = this.state.activeCurrency;
    var detlCurrency = this.state.detailCurrency;
    var actCurrencyIndex = actCurrency.indexOf(item);
    var detlCurrencyIndex = detlCurrency.indexOf(item);
    actCurrency.splice(actCurrencyIndex, 1);
    detlCurrency.splice(detlCurrencyIndex, 1);
    this.activeCurrency();
    $(".currency-list li#" + item)
      .not(":first")
      .remove();
  }

  // CALCULATE RATES
  calcCurrency(e) {
    if ($(".calc-currency").val() > 0) {
      var rates = this.rates;
      var defaultValue = this.state.calcCurrency;
      var calcNominal = e.target.value;
      for (var key in rates) {
        rates[key] = rates[key] * calcNominal;
      }
      this.setState(
        {
          calcCurrency: calcNominal,
          editInput: false
        },
        () => this.activeCurrency()
      );
      console.log(rates);
    } else {
      alert("Please input greather than 0");
      $(".calc-currency").focus();
    }
  }

  // SHOW
  showCurrency() {
    if (this.state.detailCurrency.length > 0) {
      return this.state.detailCurrency.map((item, index) => (
        <li id={item.nameCurrency} key={index}>
          <h3>
            <span className="title">{item.nameCurrency}</span>
            <span
              className="btn btn-danger btn-sm remove-list float-right"
              onClick={() => this.removeCurrency(item.nameCurrency, index)}
            >
              &times;
            </span>
            <span className="float-right">{item.rateCurrency}</span>
          </h3>
          <span className="currency-detail float-left">
            <p className="font-italic">
              <strong>
                {this.state.calcCurrency + " " + this.state.baseCurrency + " "}
              </strong>
              <strong>{item.nameCurrency + " " + item.rateCurrency}</strong>
            </p>
          </span>
        </li>
      ));
    }
  }

  render() {
    return (
      <div className="container">
        <div className="card mt-3">
          <div className="card-header">
            <p className="font-italic">
              {this.state.baseCurrency} - United States Dollar
            </p>
            <h2>
              <span className="float-left">{this.state.baseCurrency}</span>
              <button
                className="btn btn-sm btn-success float-right"
                onClick={this.editCalcRate}
              >
                Edit
              </button>
              {this.state.editInput == true ? (
                <span className="wrapper-input float-right">
                  <input
                    type="number"
                    className="form-control calc-currency"
                    onBlur={this.calcCurrency}
                  />
                </span>
              ) : (
                ""
              )}
              <span className="float-right">{this.state.calcCurrency}</span>
            </h2>
          </div>
          <div className="card-body">
            <ul className="currency-list">
              <li className="d-none" />
              {this.showCurrency()}
            </ul>
          </div>
          <div className="card-footer">
            <div className="input-group">
              <select
                className="custom-select select-currency"
                value={this.state.selectedValue}
                onChange={this.selectChange}
              >
                {this.listRates()}
              </select>
              <div className="input-group-append">
                <button
                  className="btn btn-primary"
                  type="button"
                  onMouseOver={this.selectHover}
                  onClick={this.addCurrency}
                >
                  Add More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

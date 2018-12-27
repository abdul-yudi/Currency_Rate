import React from "react";
import ReactDOM from "react-dom";

// jQuery
import $ from "jquery";

// Style
import "./bootstrap.min.css";
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

  // FETCH API
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
    var activeCurrency = this.state.activeCurrency;
    if (activeCurrency.length > 0) {
      this.setState({
        detailCurrency: activeCurrency.map(name => ({
          nameCurrency: name,
          rateCurrency: rates[name]
        }))
      });
      console.log(this.state.detailCurrency);
    }
  }

  // ADD
  addCurrency() {
    var rates = this.rates;
    var nameCurrency = this.state.selectedValue;
    if (
      $(".select-currency option:selected").val() != "0" &&
      !$(".currency-list li#" + nameCurrency).length
    ) {
      this.setState(
        {
          activeCurrency: [...this.state.activeCurrency, nameCurrency],
          detailCurrency: [
            ...this.state.detailCurrency,
            {
              nameCurrency: nameCurrency,
              rateCurrency: rates[nameCurrency]
            }
          ]
        },
        () => this.activeCurrency()
      );
      $(".card-body").animate(
        {
          scrollTop: $(".card-body")[0].scrollHeight
        },
        "slow"
      );
    } else {
      alert("Please select another / option already in the list");
    }
  }

  // REMOVE
  removeCurrency(item, index) {
    if ($(".currency-list li").length > 2) {
      var activeCurrency = this.state.activeCurrency;
      var detailCurrency = this.state.detailCurrency;
      var actCurrencyIndex = activeCurrency.indexOf(item);
      var detlCurrencyIndex = detailCurrency.indexOf(item);
      activeCurrency.splice(actCurrencyIndex, 1);
      detailCurrency.splice(detlCurrencyIndex, 1);
      this.activeCurrency();
      $(".currency-list li#" + item)
        .not(":first")
        .remove();
    } else {
      alert("Can't remove one of last, Please add more");
    }
  }

  // CALCULATE
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
    } else {
      alert("Please input greather than 0");
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
                {this.state.calcCurrency + " " + this.state.baseCurrency}
              </strong>
              &nbsp; = &nbsp;
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

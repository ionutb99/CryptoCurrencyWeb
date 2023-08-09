import React, { useEffect, useState } from "react";
import { CryptoState } from "../CryptoContext";
import axios from "axios";
import { HistoricalChart } from "../config/api";
import {
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@material-ui/core";
import { Line } from "react-chartjs-2";
import { chartDays } from "../config/data";
import { SelectButton } from "./selectButton";
import {makeStyles} from "@material-ui/core/styles";

// To fix error "category" is not a registered scale
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const useStyles = makeStyles((theme) => ({
  container: {
    width: "75%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    padding: 40,
    //Responsive now
    [theme.breakpoints.down("md")]: {
      width: "100%",
      marginTop: 0,
      padding: 20,
      paddingTop: 0,
    },
  },
}));


export const CoinInfo = ({ coin }) => {
  const [historicalData, sethistoricalData] = useState();
  const [days, setDays] = useState(1);

  const classes = useStyles();
  const { currency } = CryptoState();

  const fetchHistoricalData = async () => {
    const { data } = await axios.get(HistoricalChart(coin.id, days, currency));

    sethistoricalData(data.prices);
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [currency, days]);

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: "#fff",
      },
      type: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.container}>
        {!historicalData ? (
          <CircularProgress
            style={{ color: "gold" }}
            size={250}
            thickness={1}
          />
        ) : (
          <>
            <Line
              data={{
                labels: historicalData.map((coin) => {
                  // Check if the coin element contains a valid timestamp
                  if (coin && Array.isArray(coin) && coin.length >= 2) {
                    const timestamp = coin[0];
                    const date = new Date(timestamp);
                    const time =
                      date.getHours() > 12
                        ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                        : `${date.getHours()}:${date.getMinutes()} AM`;
                    return days === 1 ? time : date.toLocaleDateString();
                  }
                  return ""; // Return an empty string for invalid timestamps or edge cases
                }),

                datasets: [
                  {
                    data: historicalData.map((coin) => {
                      // Check if the coin element contains a valid price
                      if (coin && Array.isArray(coin) && coin.length >= 2) {
                        return coin[1];
                      }
                      return null; // Return null for invalid prices or edge cases
                    }),
                    label: `Price ( Past ${days} Days ) in ${currency}`,
                    borderColor: "#EEBC1D",
                  },
                ],
              }}
              options={{
                elements: {
                  point: {
                    radius: 1,
                  },
                },
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 20,
                justifyContent: "space-around",
                width: "100%",
              }}
            >
             
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

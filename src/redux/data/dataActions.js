// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let name = await store
        .getState()
        //.name has () because name was a variable want to get access to
        .blockchain.smartContract.methods.name()
        .call();
      let allTokens = await store
        .getState()        
        .blockchain.smartContract.methods.getAllTokens()
        //need this .call(); here otherwise it wont recognize as a function
        .call();
       

      dispatch(
        fetchDataSuccess({
          name,
          //What is ahppening is allTokens : allTokens
          allTokens, 
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};

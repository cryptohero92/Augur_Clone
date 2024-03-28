import { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useState } from 'react';
import { styled } from '@mui/system';
import { roundToTwo } from '../../app/constant';

const QuantityInput: ForwardRefRenderFunction = ({ value, setValue, step = 10, isPrice = false }, ref) => {

  const [inputValue, setInputValue] = useState('0');

  useImperativeHandle(ref, () => ({
    updateInputValue(newValue: string) {
      setInputValue(newValue);
    }
  }));

  const incrementInputValue = () => {
    setInputValue((prev) => roundToTwo(isPrice ? Math.min(Math.max(Number(prev) + step, 0), 99.9):  Math.max(Number(prev) + step, 0)).toString());
  }

  const decrementInputValue = () => {
    setInputValue((prev) => roundToTwo(Math.max(Number(prev) - step, 0)).toString());
  }

  const handleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This regex allows numbers with decimal points greater than or equal to 0.1
    const regex = /^(0|[1-9][0-9]*)(\.[0-9]{0,2})?$/;
  
    // Get current input value
    const val = e.target.value;
  
    // If the current value passes the regex test and is greater than or equal to 0.1, or if it is "0" or "0.", update the state
    if (val == "") {
      setInputValue('0');
    } else if (regex.test(val) && (isPrice ? (parseFloat(val) >= 0.1 && parseFloat(val) <= 99.9 || val === "0" || val === "0.") : true)) {
      setInputValue(val);
    }
  };

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue])

  return (
    <StyledInputRoot>
      <StyledInput value={value} onChange={handleValue} />
      <StyledLeftButtonDiv>
        <StyledButton onClick={decrementInputValue}>
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.166672 0.166664H11.8333V1.83333H0.166672V0.166664Z" fill="#333333"></path></svg>
        </StyledButton>
      </StyledLeftButtonDiv>
      <StyledRightButtonDiv>
        <StyledButton onClick={incrementInputValue}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8333 5.16666H6.83333V0.166664H5.16667V5.16666H0.166668V6.83333H5.16667V11.8333H6.83333V6.83333H11.8333V5.16666Z" fill="#333333"></path></svg>
        </StyledButton>
      </StyledRightButtonDiv>
    </StyledInputRoot>
  )
};

export default forwardRef(QuantityInput);

const StyledInputRoot = styled('div')(
  ({ theme }) => `
    position: relative;
    align-items: center;
    width: 100%;
    display: flex;
`,
);

const StyledInput = styled('input')(
  ({ theme }) => `
    display: flex;
    align-items: center;
    text-align: center;
    flex: 1 1 0%;
    border-color: #E0E0E0;
    border-width: 1px;
    border-style: solid;
    width: 100%;
    align-self: center;
    padding: 1rem;
    color: rgb(102, 102, 102);
    outline: none;
    border-radius: 8px;
    transition: all 0.2s ease 0s;
`,
);

const StyledRightButtonDiv = styled('div')(
  ({ theme }) => `
    position: absolute;
    align-items: center;
    align-self: center;
    gap: 0.5rem;
    width: 100%;
    cursor: text;
    transition: all 0.2s ease 0s;

    right: 12px;
    place-self: center right;
    display: flex;
    justify-content: right;
    width: fit-content;
  `
)

const StyledLeftButtonDiv = styled('div')(
  ({ theme }) => `
    

    position: absolute;
    align-items: center;
    align-self: center;
    gap: 0.5rem;
    width: 100%;
    cursor: text;
    transition: all 0.2s ease 0s;

    left: 12px;
    place-self: center left;
    display: flex;
    justify-content: left;
    width: fit-content;
  `
)

const StyledButton = styled('button')(
  ({ theme }) => `
    padding: 0px;
    margin: 0px;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: none;
    border-radius: 7px;
`,
);

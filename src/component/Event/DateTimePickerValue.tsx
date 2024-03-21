import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

export const addMonths = (date: Date, months: number) => {
  date.setMonth(date.getMonth() + months);  
  return date;
}

interface DateTimePickerValueProps {
    value: dayjs.Dayjs;
    onChange: (newValue: dayjs.Dayjs) => void;
}

export default function DateTimePickerValue({value, onChange}: DateTimePickerValueProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DateTimePicker']} sx={{mb:3}}>
        <DateTimePicker
          label="End Date"
          value={value}
          onChange={onChange as (value: dayjs.Dayjs | null) => void}
          disablePast
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
import React from 'react';
import { 
  Input as AntdInput,
  Slider as AntdSlider,
  TextArea as AntdTextArea,
  Rate as AntdRate,
  Selector as AntdSelector,
  Switch as AntdSwitch,
  Stepper as AntdStepper,
  Radio as AntdRadio
} from 'antd-mobile';
import { omitBy } from 'lodash';

const widgetHoc = (Widget: any) => (props: any) => {
  const widgetProps = omitBy(props, ['addons', 'schema']);
  return <Widget {...widgetProps} />
};

export const Input = widgetHoc(AntdInput);
export const Slider = widgetHoc(AntdSlider);
export const TextArea = widgetHoc(AntdTextArea);
export const Rate = widgetHoc(AntdRate);
export const Selector = widgetHoc(AntdSelector);
export const Switch = widgetHoc(AntdSwitch);
export const Stepper = widgetHoc(AntdStepper);
export const Radio = widgetHoc(AntdRadio);

export { default as DatePicker } from './DatePicker';
export { default as Cascader } from './Cascader';
export { default as Html } from './Html';
export { default as Picker } from './Picker';

// layout widget
export { default as Group } from './Group';
export { default as Card } from './Card';
// export { default as Collapse } from './Collapse';

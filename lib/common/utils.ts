/**
 * Gets all the values of a nested object and put it back at the same level as an array
 * @param subject
 * @return {*[]}
 */
export function flattenObject(subject:object):Array<any> {
  const output = [];
  let res;
  
  // Array
  if (Array.isArray(subject)) {
    res = subject.map(val => flattenObject(val)).flat();
  }
  // Object
  else if (typeof subject === 'object') {
    res = flattenObject(Object.values(subject));
  }
  // String, bool or number
  else if (['string', 'number', 'boolean'].includes(typeof subject)) {
    res = subject;
  }
  // If we did not handle the value, we throw an error
  else {
    console.log(subject);
    throw new Error("Unsupported type");
  }
  
  Array.isArray(res)
    ? output.push(...res)
    : output.push(res);
  
  return output;
}
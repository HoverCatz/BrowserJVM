// New attempt
(async () => {

    let obj = 0;
    console.log(typeof obj);
    obj = castObjectTo(obj, 'boolean');
    console.log(typeof obj, obj);

})();
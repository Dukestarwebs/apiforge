const getGradleTasks = (fmt) => ({ apk:'assembleRelease', aab:'bundleRelease', both:'assembleRelease bundleRelease' }[fmt] || 'assembleRelease');
const getOutputFiles = (fmt) => ({ apk:['apk'], aab:['aab'], both:['apk','aab'] }[fmt] || ['apk']);
module.exports = { getGradleTasks, getOutputFiles };

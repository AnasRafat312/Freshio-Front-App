const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
            findTsFiles(filePath, fileList);
        } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to extract API endpoints from file content
function extractEndpoints(content, filePath) {
    const endpoints = {
        GETWAY_API_ENDPOINT: [],
        BASIC_DATA_API_ENDPOINT: [],
        ACTIVITY_API_ENDPOINT: [],
        CRM_API_ENDPOINT: [],
        FINANCE_API_ENDPOINT: [],
        MAIN_GetwAY_API_ENDPOINT: [],
        PAYROLL_HR_ENDPOINT: [],
        WAREHOUSE_API_ENDPOINT: [],
        TICKETS_API_ENDPOINT: [],
        PIPELINE_API_ENDPOINT: [],
        SRM_API_ENDPOINT: []
    };
    
    // Enhanced regex patterns to match various API call formats
    const patterns = [
        // this.constant.ENDPOINT patterns
        { regex: /this\.constant\.GETWAY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'GETWAY_API_ENDPOINT' },
        { regex: /this\.constant\.BASIC_DATA_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'BASIC_DATA_API_ENDPOINT' },
        { regex: /this\.constant\.ACTIVITY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'ACTIVITY_API_ENDPOINT' },
        { regex: /this\.constant\.CRM_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'CRM_API_ENDPOINT' },
        { regex: /this\.constant\.FINANCE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'FINANCE_API_ENDPOINT' },
        { regex: /this\.constant\.MAIN_GetwAY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'MAIN_GetwAY_API_ENDPOINT' },
        { regex: /this\.constant\.PAYROLL_HR_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'PAYROLL_HR_ENDPOINT' },
        { regex: /this\.constant\.WAREHOUSE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'WAREHOUSE_API_ENDPOINT' },
        { regex: /this\.constant\.TICKETS_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'TICKETS_API_ENDPOINT' },
        { regex: /this\.constant\.PIPELINE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'PIPELINE_API_ENDPOINT' },
        { regex: /this\.constant\.SRM_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'SRM_API_ENDPOINT' },
        
        // config.ENDPOINT patterns
        { regex: /config\.GETWAY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'GETWAY_API_ENDPOINT' },
        { regex: /config\.BASIC_DATA_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'BASIC_DATA_API_ENDPOINT' },
        { regex: /config\.ACTIVITY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'ACTIVITY_API_ENDPOINT' },
        { regex: /config\.CRM_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'CRM_API_ENDPOINT' },
        { regex: /config\.FINANCE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'FINANCE_API_ENDPOINT' },
        { regex: /config\.MAIN_GetwAY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'MAIN_GetwAY_API_ENDPOINT' },
        { regex: /config\.PAYROLL_HR_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'PAYROLL_HR_ENDPOINT' },
        { regex: /config\.WAREHOUSE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'WAREHOUSE_API_ENDPOINT' },
        { regex: /config\.TICKETS_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'TICKETS_API_ENDPOINT' },
        { regex: /config\.PIPELINE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'PIPELINE_API_ENDPOINT' },
        { regex: /config\.SRM_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'SRM_API_ENDPOINT' },
        
        // Direct ENDPOINT patterns (without this.constant or config)
        { regex: /GETWAY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'GETWAY_API_ENDPOINT' },
        { regex: /BASIC_DATA_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'BASIC_DATA_API_ENDPOINT' },
        { regex: /ACTIVITY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'ACTIVITY_API_ENDPOINT' },
        { regex: /CRM_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'CRM_API_ENDPOINT' },
        { regex: /FINANCE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'FINANCE_API_ENDPOINT' },
        { regex: /MAIN_GetwAY_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'MAIN_GetwAY_API_ENDPOINT' },
        { regex: /PAYROLL_HR_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'PAYROLL_HR_ENDPOINT' },
        { regex: /WAREHOUSE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'WAREHOUSE_API_ENDPOINT' },
        { regex: /TICKETS_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'TICKETS_API_ENDPOINT' },
        { regex: /PIPELINE_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'PIPELINE_API_ENDPOINT' },
        { regex: /SRM_API_ENDPOINT\s*\+\s*['`"]([^'`"]+)['`"]/g, type: 'SRM_API_ENDPOINT' }
    ];
    
    // Template literal patterns
    const templatePatterns = [
        { regex: /\$\{this\.constant\.GETWAY_API_ENDPOINT\}([^`}]+)/g, type: 'GETWAY_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.BASIC_DATA_API_ENDPOINT\}([^`}]+)/g, type: 'BASIC_DATA_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.ACTIVITY_API_ENDPOINT\}([^`}]+)/g, type: 'ACTIVITY_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.CRM_API_ENDPOINT\}([^`}]+)/g, type: 'CRM_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.FINANCE_API_ENDPOINT\}([^`}]+)/g, type: 'FINANCE_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.MAIN_GetwAY_API_ENDPOINT\}([^`}]+)/g, type: 'MAIN_GetwAY_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.PAYROLL_HR_ENDPOINT\}([^`}]+)/g, type: 'PAYROLL_HR_ENDPOINT' },
        { regex: /\$\{this\.constant\.WAREHOUSE_API_ENDPOINT\}([^`}]+)/g, type: 'WAREHOUSE_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.TICKETS_API_ENDPOINT\}([^`}]+)/g, type: 'TICKETS_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.PIPELINE_API_ENDPOINT\}([^`}]+)/g, type: 'PIPELINE_API_ENDPOINT' },
        { regex: /\$\{this\.constant\.SRM_API_ENDPOINT\}([^`}]+)/g, type: 'SRM_API_ENDPOINT' },
        
        { regex: /\$\{config\.GETWAY_API_ENDPOINT\}([^`}]+)/g, type: 'GETWAY_API_ENDPOINT' },
        { regex: /\$\{config\.BASIC_DATA_API_ENDPOINT\}([^`}]+)/g, type: 'BASIC_DATA_API_ENDPOINT' },
        { regex: /\$\{config\.ACTIVITY_API_ENDPOINT\}([^`}]+)/g, type: 'ACTIVITY_API_ENDPOINT' },
        { regex: /\$\{config\.CRM_API_ENDPOINT\}([^`}]+)/g, type: 'CRM_API_ENDPOINT' },
        { regex: /\$\{config\.FINANCE_API_ENDPOINT\}([^`}]+)/g, type: 'FINANCE_API_ENDPOINT' },
        { regex: /\$\{config\.MAIN_GetwAY_API_ENDPOINT\}([^`}]+)/g, type: 'MAIN_GetwAY_API_ENDPOINT' },
        { regex: /\$\{config\.PAYROLL_HR_ENDPOINT\}([^`}]+)/g, type: 'PAYROLL_HR_ENDPOINT' },
        { regex: /\$\{config\.WAREHOUSE_API_ENDPOINT\}([^`}]+)/g, type: 'WAREHOUSE_API_ENDPOINT' },
        { regex: /\$\{config\.TICKETS_API_ENDPOINT\}([^`}]+)/g, type: 'TICKETS_API_ENDPOINT' },
        { regex: /\$\{config\.PIPELINE_API_ENDPOINT\}([^`}]+)/g, type: 'PIPELINE_API_ENDPOINT' },
        { regex: /\$\{config\.SRM_API_ENDPOINT\}([^`}]+)/g, type: 'SRM_API_ENDPOINT' }
    ];
    
    // SharedService patterns
    const sharedServicePatterns = [
        { regex: /sharedService\.(Create|Update|Delete|Get|Post|Put)\s*\(\s*['`"]([^'`"]+)['`"]/g, type: null },
        { regex: /this\.sharedService\.(Create|Update|Delete|Get|Post|Put)\s*\(\s*['`"]([^'`"]+)['`"]/g, type: null }
    ];
    
    // Function to clean endpoint
    function cleanEndpoint(endpoint) {
        if (!endpoint) return '';
        
        // Remove leading/trailing whitespace and slashes
        endpoint = endpoint.trim().replace(/^\/+|\/+$/g, '');
        
        // Skip if it looks like a file path or contains unwanted characters
        if (endpoint.includes('.html') || endpoint.includes('.css') || endpoint.includes('.js') || 
            endpoint.includes('${') || endpoint.includes('localStorage') || endpoint.length < 3) {
            return '';
        }
        
        // Replace dynamic parts
        endpoint = endpoint.replace(/\/\d+/g, '/{id}');
        endpoint = endpoint.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '/{guid}');
        
        return endpoint;
    }
    
    // Function to categorize SharedService endpoints
    function categorizeSharedServiceEndpoint(endpoint) {
        const lowerEndpoint = endpoint.toLowerCase();
        
        if (lowerEndpoint.includes('company') || lowerEndpoint.includes('branch') || 
            lowerEndpoint.includes('entity') || lowerEndpoint.includes('location') ||
            lowerEndpoint.includes('country') || lowerEndpoint.includes('city') ||
            lowerEndpoint.includes('governorate') || lowerEndpoint.includes('district') ||
            lowerEndpoint.includes('unit') || lowerEndpoint.includes('position')) {
            return 'BASIC_DATA_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('role') || lowerEndpoint.includes('user') || 
            lowerEndpoint.includes('group') || lowerEndpoint.includes('privilege') ||
            lowerEndpoint.includes('permission') || lowerEndpoint.includes('account') ||
            lowerEndpoint.includes('assembleuser')) {
            return 'GETWAY_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('hr') || lowerEndpoint.includes('payroll') || 
            lowerEndpoint.includes('employee')) {
            return 'PAYROLL_HR_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('finance') || lowerEndpoint.includes('payment') || 
            lowerEndpoint.includes('invoice')) {
            return 'FINANCE_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('warehouse') || lowerEndpoint.includes('inventory') || 
            lowerEndpoint.includes('stock')) {
            return 'WAREHOUSE_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('ticket') || lowerEndpoint.includes('support')) {
            return 'TICKETS_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('crm') || lowerEndpoint.includes('customer') || 
            lowerEndpoint.includes('lead')) {
            return 'CRM_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('activity') || lowerEndpoint.includes('log') || 
            lowerEndpoint.includes('audit')) {
            return 'ACTIVITY_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('pipeline') || lowerEndpoint.includes('workflow')) {
            return 'PIPELINE_API_ENDPOINT';
        }
        
        if (lowerEndpoint.includes('srm') || lowerEndpoint.includes('supplier') || 
            lowerEndpoint.includes('vendor')) {
            return 'SRM_API_ENDPOINT';
        }
        
        return 'GETWAY_API_ENDPOINT'; // Default
    }
    
    // Process regular patterns
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
            const endpoint = cleanEndpoint(match[1]);
            if (endpoint && !endpoints[pattern.type].includes(endpoint)) {
                endpoints[pattern.type].push(endpoint);
            }
        }
    });
    
    // Process template literal patterns
    templatePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
            const endpoint = cleanEndpoint(match[1]);
            if (endpoint && !endpoints[pattern.type].includes(endpoint)) {
                endpoints[pattern.type].push(endpoint);
            }
        }
    });
    
    // Process SharedService patterns
    sharedServicePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
            const endpoint = cleanEndpoint(match[2]);
            if (endpoint) {
                const category = categorizeSharedServiceEndpoint(endpoint);
                if (!endpoints[category].includes(endpoint)) {
                    endpoints[category].push(endpoint);
                }
            }
        }
    });
    
    return endpoints;
}

// Main function
function main() {
    const srcDir = path.join(__dirname, 'src');
    const tsFiles = findTsFiles(srcDir);
    
    const allEndpoints = {
        GETWAY_API_ENDPOINT: [],
        BASIC_DATA_API_ENDPOINT: [],
        ACTIVITY_API_ENDPOINT: [],
        CRM_API_ENDPOINT: [],
        FINANCE_API_ENDPOINT: [],
        MAIN_GetwAY_API_ENDPOINT: [],
        PAYROLL_HR_ENDPOINT: [],
        WAREHOUSE_API_ENDPOINT: [],
        TICKETS_API_ENDPOINT: [],
        PIPELINE_API_ENDPOINT: [],
        SRM_API_ENDPOINT: []
    };
    
    console.log(`Found ${tsFiles.length} TypeScript files to analyze...`);
    
    let processedFiles = 0;
    tsFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const endpoints = extractEndpoints(content, filePath);
            
            // Merge endpoints
            Object.keys(endpoints).forEach(apiType => {
                endpoints[apiType].forEach(endpoint => {
                    if (!allEndpoints[apiType].includes(endpoint)) {
                        allEndpoints[apiType].push(endpoint);
                    }
                });
            });
            
            processedFiles++;
            if (processedFiles % 50 === 0) {
                console.log(`Processed ${processedFiles}/${tsFiles.length} files...`);
            }
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
        }
    });
    
    // Sort endpoints alphabetically
    Object.keys(allEndpoints).forEach(apiType => {
        allEndpoints[apiType].sort();
    });
    
    // Remove empty categories
    const filteredEndpoints = {};
    Object.keys(allEndpoints).forEach(apiType => {
        if (allEndpoints[apiType].length > 0) {
            filteredEndpoints[apiType] = allEndpoints[apiType];
        }
    });
    
    // Write results to JSON file
    const outputFile = 'all-api-endpoints.json';
    fs.writeFileSync(outputFile, JSON.stringify(filteredEndpoints, null, 2));
    
    console.log(`\nExtracted API endpoints:`);
    Object.keys(filteredEndpoints).forEach(apiType => {
        console.log(`${apiType}: ${filteredEndpoints[apiType].length} endpoints`);
    });
    
    console.log(`\nTotal unique endpoints: ${Object.values(filteredEndpoints).flat().length}`);
    console.log(`Results saved to: ${outputFile}`);
    
    // Display sample results
    console.log(`\nSample Results:`);
    Object.keys(filteredEndpoints).forEach(apiType => {
        if (filteredEndpoints[apiType].length > 0) {
            console.log(`\n${apiType}:`);
            filteredEndpoints[apiType].slice(0, 5).forEach(endpoint => {
                console.log(`  - ${endpoint}`);
            });
            if (filteredEndpoints[apiType].length > 5) {
                console.log(`  ... and ${filteredEndpoints[apiType].length - 5} more`);
            }
        }
    });
    
    return filteredEndpoints;
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, extractEndpoints, findTsFiles };

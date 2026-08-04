import os

path = 'frontend/src/pages/AdminDashboard.tsx'

with open(path, 'r') as f:
    content = f.read()

# Check the structure first
lines = content.split('\n')

# Find specific patterns and fix them
# 1. Stat cards - count opening vs closing divs around Card
fix1_old = '                    </div>\n                </Card>'
fix1_new = '                    </div>\n                  </div>\n                </Card>'
content = content.replace(fix1_old, fix1_new)

# 2. Modal grid closing  
fix2_old = '              </div>\n          <div className="border-t pt-4 mb-6">'
fix2_new = '              </div>\n            </div>\n          <div className="border-t pt-4 mb-6">'
content = content.replace(fix2_old, fix2_new)

# 3. Pagamento section closing
fix3_old = '            {selectedOrder.tracking_number and <p className="text-sm">Rastreio: <span className="font-mono text-xs">{selectedOrder.tracking_number}</span></p>}\n          </div>\n          <div className="border-t pt-4">'
fix3_new = '            {selectedOrder.tracking_number and <p className="text-sm">Rastreio: <span className="font-mono text-xs">{selectedOrder.tracking_number}</span></p>}\n            </div>\n          </div>\n          <div className="border-t pt-4">'
content = content.replace(fix3_old, fix3_new)

with open(path, 'w') as f:
    f.write(content)

print('File fixed!')

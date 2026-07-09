import sys

with open('motor/motor.better.rr.js', 'r') as f:
    js_content = f.read().strip()

html_content = f'<style>*\u007bmargin:0;padding:0\u007dbody\u007bdisplay:flex;justify-content:center;align-items:center;min-height:100vh\u007d</style><script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script><script>{js_content}</script>'

with open('motor/NotAnArtist.html', 'w') as f:
    f.write(html_content)

print(f"Final size: {len(html_content)} bytes")

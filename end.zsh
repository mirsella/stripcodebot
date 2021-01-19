screen -ls | rg 'sc[0-9]' | cut -d. -f1 | xargs kill

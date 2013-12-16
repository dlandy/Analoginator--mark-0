I = {"name":"I", "args":[], "action":{"I":I, "H":H, "V":V, "S":S}}
H = {"name":"H", "args":[], "action":{"I":H, "H":I, "V":S, "S":V}}
V = {"name":"V", "args":[], "action":{"I":V, "H":S, "V":I, "S":H}}
S = {"name":"S", "args":[], "action":{"I":S, "H":V, "V":H, "S":I}}


def do(action, state):
    return (action['action'])[state['name']]



mapping = {I:I, H:V, V:H, S:S}

def translateName(name, mapping):
    for key in mapping.keys():
        if mapping[key]['name'] == name:
            return mapping[key]

    return "fail"



def translate(element, mapping):
    newElement = {"name":"", "args":[], "action":{}}
    if(mapping.has_key(action)):
        newElement['name']=mapping[action]['name']
        newElement['args'] = [translate(arg, mapping) for arg in action['args']] # Assumes matching arity!
        newAction = {}
        oldAction = action['action']
        for key in oldAction.keys():
            newAction[translateName(key, mapping)['name']] = translate(oldAction[key], mapping)
        newElement['action'] = newAction






